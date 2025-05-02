import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { createSupabaseClient } from '../utils/supabase';
import { ItineraryItem } from '../types/supabase';
import { useAuth } from '../hooks/useAuth';
import { ITINERARY_CATEGORIES, getCategoryEmoji } from '../constants/itinerary';
import { TABLES, COLUMNS, ENUM_VALUES } from '../constants/database';

type EditItineraryItemScreenProps = {
  route: {
    params: {
      tripId: string;
      itemId?: string; // Optional - if provided, we're editing an existing item
      dayNumber?: number; // Optional - if provided, we're creating an item for this day
    };
  };
  navigation: any;
};

export default function EditItineraryItemScreen({
  route,
  navigation,
}: EditItineraryItemScreenProps) {
  const { tripId, itemId, dayNumber: initialDayNumber } = route.params;
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Item form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [dayNumber, setDayNumber] = useState<number | null>(initialDayNumber || null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');

  useEffect(() => {
    if (itemId) {
      // We're editing an existing item - load it
      loadItineraryItem();
    } else {
      // We're creating a new item
      setIsLoading(false);
    }

    // Set up navigation options
    navigation.setOptions({
      title: itemId ? 'Edit Itinerary Item' : 'New Itinerary Item',
      headerRight: () => (
        <TouchableOpacity style={styles.headerButton} onPress={handleSave} disabled={isSaving}>
          <Text style={styles.headerButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [itemId, isSaving, title]);

  const loadItineraryItem = async () => {
    try {
      setIsLoading(true);
      const supabase = createSupabaseClient();

      const { data, error } = await supabase
        .from(TABLES.ITINERARY_ITEMS)
        .select('*')
        .eq(COLUMNS.ID, itemId)
        .single();

      if (error) {
        console.error('Error loading itinerary item:', error);
        Alert.alert('Error', 'Failed to load itinerary item');
        navigation.goBack();
        return;
      }

      if (!data) {
        Alert.alert('Error', 'Itinerary item not found');
        navigation.goBack();
        return;
      }

      // Set form data from the item
      const item = data as unknown as ItineraryItem;
      setTitle(item.title);
      setDescription(item.description || '');
      setCategory(item.category);
      setDayNumber(item.day_number);
      setStartTime(item.start_time);
      setEndTime(item.end_time);
      setLocationName(item.location_name || '');
      setLocationAddress(item.location_address || '');
    } catch (err) {
      console.error('Error in loadItineraryItem:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    try {
      setIsSaving(true);
      const supabase = createSupabaseClient();

      const itemData: Partial<ItineraryItem> = {
        title: title.trim(),
        description: description.trim() || null,
        category,
        day_number: dayNumber,
        start_time: startTime,
        end_time: endTime,
        location_name: locationName.trim() || null,
        location_address: locationAddress.trim() || null,
      };

      if (itemId) {
        // Update existing item
        const { error } = await supabase
          .from(TABLES.ITINERARY_ITEMS)
          .update(itemData)
          .eq(COLUMNS.ID, itemId);

        if (error) {
          console.error('Error updating itinerary item:', error);
          Alert.alert('Error', 'Failed to update itinerary item');
          return;
        }

        Alert.alert('Success', 'Itinerary item updated successfully');
      } else {
        // Create new item
        if (!user?.id) {
          Alert.alert('Error', 'You must be logged in to create an itinerary item');
          return;
        }

        const newItemData = {
          ...itemData,
          trip_id: tripId,
          created_by: user.id,
          status: ENUM_VALUES.ITINERARY_ITEM_STATUS.SUGGESTED,
        };

        const { error } = await supabase.from(TABLES.ITINERARY_ITEMS).insert([newItemData]);

        if (error) {
          console.error('Error creating itinerary item:', error);
          Alert.alert('Error', 'Failed to create itinerary item');
          return;
        }

        Alert.alert('Success', 'Itinerary item created successfully');
      }

      // Navigate back to itinerary screen
      navigation.goBack();
    } catch (err) {
      console.error('Error in handleSave:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemId) return;

    try {
      setIsSaving(true);
      const supabase = createSupabaseClient();

      const { error } = await supabase.from(TABLES.ITINERARY_ITEMS).delete().eq(COLUMNS.ID, itemId);

      if (error) {
        console.error('Error deleting itinerary item:', error);
        Alert.alert('Error', 'Failed to delete itinerary item');
        return;
      }

      Alert.alert('Success', 'Itinerary item deleted successfully');
      navigation.goBack();
    } catch (err) {
      console.error('Error in handleDelete:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
      setIsDeleteConfirmVisible(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066ff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title*</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter title"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowCategoryPicker(true)}
          >
            {category ? (
              <View style={styles.selectedCategory}>
                <Text style={styles.categoryEmoji}>{getCategoryEmoji(category)}</Text>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ) : (
              <Text style={styles.placeholderText}>Select a category</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Day Number</Text>
          <TextInput
            style={styles.input}
            value={dayNumber !== null ? String(dayNumber) : ''}
            onChangeText={(text) => {
              const num = parseInt(text);
              setDayNumber(isNaN(num) ? null : num);
            }}
            placeholder="Enter day number (optional)"
            placeholderTextColor="#999"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location Name</Text>
          <TextInput
            style={styles.input}
            value={locationName}
            onChangeText={setLocationName}
            placeholder="Enter location name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location Address</Text>
          <TextInput
            style={styles.input}
            value={locationAddress}
            onChangeText={setLocationAddress}
            placeholder="Enter location address"
            placeholderTextColor="#999"
          />
        </View>

        {/* TODO: Add time pickers for start and end time */}

        {itemId && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => setIsDeleteConfirmVisible(true)}
          >
            <Text style={styles.deleteButtonText}>Delete Item</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryPicker(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={ITINERARY_CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => {
                    setCategory(item);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.categoryItemEmoji}>{getCategoryEmoji(item)}</Text>
                  <Text style={styles.categoryItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteConfirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDeleteConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Delete Item?</Text>
            <Text style={styles.confirmText}>
              This action cannot be undone. The item will be permanently deleted.
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setIsDeleteConfirmVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteConfirmButton]}
                onPress={handleDelete}
              >
                <Text style={styles.deleteConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textarea: {
    minHeight: 100,
  },
  categorySelector: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff3b30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  deleteButtonText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#0066ff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#999',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryItemEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryItemText: {
    fontSize: 16,
    color: '#333',
  },
  confirmModalContent: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  confirmText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  deleteConfirmButton: {
    backgroundColor: '#ff3b30',
    marginLeft: 8,
  },
  deleteConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
