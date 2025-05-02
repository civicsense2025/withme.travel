import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  ImageBackground,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Text, Button } from '../components/ui'; // Import themed components
import { Card } from '../components/ui/Card';
import { getAllItineraryTemplates } from '../utils/database';
import { fetchWithCache, clearCacheEntry } from '../utils/cache';
import { ItineraryTemplate } from '../types/supabase'; // Correctly import the type
import { Feather } from '@expo/vector-icons';
import { TABLES, COLUMNS } from '../constants/database';

// Section for templates grouped by category or destination
interface TemplateSection {
  id: string;
  title: string;
  data: ItineraryTemplate[];
}

// Memoized Template Card Component
const TemplateCard = memo(
  ({
    template,
    onPress,
  }: {
    template: ItineraryTemplate;
    onPress: (templateId: string) => void;
  }) => {
    const theme = useTheme();
    const { width } = useWindowDimensions();
    // Set card width based on screen size - show 1.5 cards at a time
    const cardWidth = (width - theme.spacing['4'] * 3) * 0.7;

    const handlePress = () => {
      onPress(template.id);
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={[styles.templateCardContainer, { width: cardWidth }]}
      >
        <Card variant="elevated" padding="none" style={styles.templateCard}>
          {template.image_url ? (
            <ImageBackground
              source={{ uri: template.image_url }}
              style={styles.templateImageBackground}
              imageStyle={styles.templateImageStyle}
            >
              <View style={styles.templateOverlay}>
                <View style={styles.templateContentContainer}>
                  <Text
                    variant="h3"
                    weight="bold"
                    color="custom"
                    customColor="#fff"
                    numberOfLines={1}
                  >
                    {template.name}
                  </Text>

                  {template.destination_city && (
                    <Text
                      variant="body2"
                      color="custom"
                      customColor="rgba(255, 255, 255, 0.9)"
                      style={styles.templateLocation}
                    >
                      {template.destination_city}
                    </Text>
                  )}

                  {template.duration_days && (
                    <View style={styles.durationContainer}>
                      <Text variant="caption" weight="medium" color="custom" customColor="#fff">
                        {template.duration_days} {template.duration_days === 1 ? 'day' : 'days'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </ImageBackground>
          ) : (
            <View style={[styles.noImageContainer, { backgroundColor: theme.colors.travelMint }]}>
              <View style={styles.templateContentContainer}>
                <Text
                  variant="h3"
                  weight="bold"
                  color="custom"
                  customColor="#fff"
                  numberOfLines={1}
                >
                  {template.name}
                </Text>

                {template.destination_city && (
                  <Text
                    variant="body2"
                    color="custom"
                    customColor="rgba(255, 255, 255, 0.9)"
                    style={styles.templateLocation}
                  >
                    {template.destination_city}
                  </Text>
                )}

                {template.duration_days && (
                  <View style={styles.durationContainer}>
                    <Text variant="caption" weight="medium" color="custom" customColor="#fff">
                      {template.duration_days} {template.duration_days === 1 ? 'day' : 'days'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  }
);

export default function ItinerariesScreen({ navigation }: any) {
  const theme = useTheme();
  const [templates, setTemplates] = useState<ItineraryTemplate[]>([]);
  const [templateSections, setTemplateSections] = useState<TemplateSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = async (forceRefresh = false) => {
    try {
      setIsLoading(!refreshing);
      setError(null);

      const cacheKey = 'itinerary_templates_all';

      if (forceRefresh) {
        await clearCacheEntry(cacheKey);
      }

      const fetcher = async () => {
        const data = await getAllItineraryTemplates({ 
          column: COLUMNS.NAME, 
          ascending: true 
        });
        return data as ItineraryTemplate[];
      };

      const data = await fetchWithCache(cacheKey, fetcher, 60 * 60 * 1000); // Cache for 1 hour
      setTemplates(data || []);

      // Group templates by destination_city or other criteria
      organizeTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Function to organize templates into sections
  const organizeTemplates = (templates: ItineraryTemplate[]) => {
    // Create a "Featured" section with the first few templates
    const featuredTemplates = templates.slice(0, Math.min(5, templates.length));

    // Group remaining templates by destination city
    const templatesByDestination: Record<string, ItineraryTemplate[]> = {};
    templatesByDestination['Other'] = [];

    templates.forEach((template) => {
      if (!template.destination_city) {
        templatesByDestination['Other'].push(template);
        return;
      }

      if (!templatesByDestination[template.destination_city]) {
        templatesByDestination[template.destination_city] = [];
      }

      templatesByDestination[template.destination_city].push(template);
    });

    // Convert to section format
    const sections: TemplateSection[] = [
      // Featured section first
      {
        id: 'featured',
        title: 'Featured Itineraries',
        data: featuredTemplates,
      },
    ];

    // Add destination sections
    Object.keys(templatesByDestination)
      .filter((city) => city !== 'Other' && templatesByDestination[city].length > 0)
      .sort()
      .forEach((city) => {
        sections.push({
          id: `city-${city}`,
          title: `${city} Itineraries`,
          data: templatesByDestination[city],
        });
      });

    // Add the 'Other' section last if it has items
    if (templatesByDestination['Other'].length > 0) {
      sections.push({
        id: 'other',
        title: 'Other Itineraries',
        data: templatesByDestination['Other'],
      });
    }

    setTemplateSections(sections);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTemplates(true);
  }, []);

  const handleTemplatePress = useCallback(
    (templateId: string) => {
      // Navigate to template detail view
      navigation.navigate('TemplateDetail', { templateId });
    },
    [navigation]
  );

  // Render a template section with horizontal carousel
  const renderTemplateSection = useCallback(
    ({ section }: { section: TemplateSection }) => {
      if (section.data.length === 0) return null;

      return (
        <View style={styles.templateSection}>
          <Text variant="h3" weight="bold" style={styles.sectionTitle}>
            {section.title}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templateCarousel}
          >
            {section.data.map((template) => (
              <TemplateCard key={template.id} template={template} onPress={handleTemplatePress} />
            ))}

            {section.id === 'featured' && (
              <TouchableOpacity
                style={styles.createTemplateCard}
                onPress={() => navigation.navigate('CreateTemplate')}
              >
                <Card variant="bordered" style={styles.createTemplateCardInner}>
                  <Feather name="file-plus" size={36} color={theme.colors.primary} />
                  <Text
                    variant="body1"
                    weight="medium"
                    color="primary"
                    style={{ marginTop: theme.spacing['2'] }}
                  >
                    Create New Template
                  </Text>
                </Card>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      );
    },
    [handleTemplatePress, navigation, theme]
  );

  // Loading state
  if (isLoading && !refreshing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Error state
  if (error && !refreshing && templates.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text
          variant="body1"
          color="custom"
          customColor={theme.colors.destructive}
          style={{ marginBottom: theme.spacing['4'] }}
        >
          Error: {error}
        </Text>
        <Button label="Retry" onPress={() => loadTemplates(true)} />
      </View>
    );
  }

  // Main render
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <Text variant="h2" weight="bold" style={styles.mainTitle}>
          Itinerary Templates
        </Text>
        <Text variant="body1" color="muted" style={styles.mainSubtitle}>
          Find ready-made travel plans for your next trip
        </Text>

        {templateSections.length > 0 ? (
          templateSections.map((section) => (
            <View key={section.id}>{renderTemplateSection({ section })}</View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📝</Text>
            <Text variant="body1" weight="medium" style={styles.emptyStateText}>
              No itinerary templates available yet
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mainTitle: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  mainSubtitle: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  templateSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  templateCarousel: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  templateCardContainer: {
    marginRight: 12,
  },
  templateCard: {
    height: 220,
    overflow: 'hidden',
  },
  templateImageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  templateImageStyle: {
    borderRadius: 16,
  },
  templateOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    borderRadius: 16,
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    borderRadius: 16,
  },
  templateContentContainer: {
    padding: 16,
  },
  templateLocation: {
    marginTop: 4,
  },
  durationContainer: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  createTemplateCard: {
    width: 180,
    height: 220,
    marginRight: 16,
  },
  createTemplateCardInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    textAlign: 'center',
  },
});
