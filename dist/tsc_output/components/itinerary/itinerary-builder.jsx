"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, MapPin, Clock, DollarSign, Edit, Trash2, PlusCircle, Link as LinkIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { API_ROUTES } from "@/utils/constants";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { APIProvider } from '@vis.gl/react-google-maps';
import { PlaceAutocomplete } from './place-autocomplete';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { debounce } from 'lodash';
// Define ItemTypes locally
const ItemTypes = {
    ITINERARY_ITEM: 'itineraryItem',
};
export function ItineraryBuilder({ tripId, destinationId }) {
    const router = useRouter();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState(null);
    const [places, setPlaces] = useState([]);
    const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showSuggestDialog, setShowSuggestDialog] = useState(false);
    const [showManualAddDialog, setShowManualAddDialog] = useState(false);
    const [selectedDayForAdd, setSelectedDayForAdd] = useState(1);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [selectedGooglePlace, setSelectedGooglePlace] = useState(null);
    const [newPlaceSuggestion, setNewPlaceSuggestion] = useState({
        name: "",
        description: "",
        category: "attraction",
        address: "",
        price_level: 1,
    });
    const [itemsByDay, setItemsByDay] = useState({});
    const [durationDays, setDurationDays] = useState(1);
    const [isLoadingItineraryItems, setIsLoadingItineraryItems] = useState(true);
    const [manualItem, setManualItem] = useState({
        title: "",
        description: "",
        day_number: 1,
        start_time: "",
        end_time: "",
        estimated_cost: "",
        currency: "USD",
        duration_minutes: "",
    });
    const [templates, setTemplates] = useState([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [inlineEditValue, setInlineEditValue] = useState("");
    const [urlToScrape, setUrlToScrape] = useState("");
    const [isScraping, setIsScraping] = useState(false);
    const [scrapeError, setScrapeError] = useState(null);
    const fetchItineraryItems = useCallback(async () => {
        setIsLoadingItineraryItems(true);
        try {
            const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId));
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to fetch itinerary items");
            }
            const data = await response.json();
            setDurationDays(data.durationDays || 1);
            setItemsByDay(data.itemsByDay || {});
        }
        catch (error) {
            console.error("Error fetching itinerary items:", error);
            toast({ title: "Error Loading Itinerary", description: error.message, variant: "destructive" });
        }
        finally {
            setIsLoadingItineraryItems(false);
        }
    }, [tripId, toast]);
    const moveItem = useCallback(async (itemId, targetItemId, targetDayNumber) => {
        // Find item and its current position
        let sourceDay = null;
        let sourceIndex = -1;
        Object.entries(itemsByDay).forEach(([day, items]) => {
            const index = items.findIndex((i) => i.id === itemId);
            if (index !== -1) {
                sourceDay = Number(day);
                sourceIndex = index;
            }
        });
        if (sourceDay === null || sourceIndex === -1) {
            console.error("Source item not found for move");
            return;
        }
        const itemToMove = itemsByDay[sourceDay][sourceIndex];
        // Optimistic Update
        setItemsByDay((prev) => {
            var _a;
            const newItemsByDay = JSON.parse(JSON.stringify(prev));
            // Remove from source
            newItemsByDay[sourceDay] = newItemsByDay[sourceDay].filter((i) => i.id !== itemId);
            if (((_a = newItemsByDay[sourceDay]) === null || _a === void 0 ? void 0 : _a.length) === 0 && sourceDay !== 0) {
                // Optional: delete day if empty? Depends on desired behavior
                // delete newItemsByDay[sourceDay!];
            }
            // Add to target day/position
            if (!newItemsByDay[targetDayNumber]) {
                newItemsByDay[targetDayNumber] = [];
            }
            let targetIndex = newItemsByDay[targetDayNumber].length; // Default to end
            if (targetItemId) {
                const idx = newItemsByDay[targetDayNumber].findIndex((i) => i.id === targetItemId);
                if (idx !== -1) {
                    targetIndex = idx; // Insert before target item 
                }
            }
            newItemsByDay[targetDayNumber].splice(targetIndex, 0, Object.assign(Object.assign({}, itemToMove), { day_number: targetDayNumber }));
            return newItemsByDay;
        });
        // API Call to update backend (example structure)
        const itemsToUpdateApi = Object.entries(itemsByDay).flatMap(([day, items]) => items.map((item, index) => ({
            id: item.id,
            day_number: Number(day),
            position: index // Send updated position/day
        })));
        if (itemsToUpdateApi.length > 0) {
            try {
                // Assuming API_ROUTES.TRIP_ITINERARY_REORDER exists
                const reorderUrl = API_ROUTES.TRIP_ITINERARY_REORDER(tripId);
                const reorderResponse = await fetch(reorderUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: itemsToUpdateApi }),
                });
                if (!reorderResponse.ok)
                    throw new Error("Failed to save new order");
            }
            catch (error) {
                console.error("Error reordering items:", error);
                toast({ title: "Reorder Error", description: error.message, variant: "destructive" });
                fetchItineraryItems(); // Now accessible
            }
        }
    }, [itemsByDay, tripId, toast, fetchItineraryItems]);
    const debouncedFetchPlaces = useCallback(debounce(async (query, type) => {
        setIsLoadingPlaces(true);
        try {
            const effectiveDestinationId = destinationId || tripId;
            const params = new URLSearchParams(Object.assign(Object.assign({ destination_id: effectiveDestinationId }, (query && { query: query })), (type && { type: type })));
            const response = await fetch(`${API_ROUTES.PLACES}?${params}`);
            if (!response.ok)
                throw new Error("Failed to fetch places");
            const data = await response.json();
            setPlaces(data.places);
        }
        catch (error) {
            console.error("Error fetching places:", error);
            toast({
                title: "Error",
                description: "Failed to load places. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setIsLoadingPlaces(false);
        }
    }, 500), [tripId, destinationId, toast]);
    useEffect(() => {
        debouncedFetchPlaces(searchQuery, selectedType);
        return () => debouncedFetchPlaces.cancel();
    }, [searchQuery, selectedType, debouncedFetchPlaces]);
    useEffect(() => {
        async function fetchTemplates() {
            if (!destinationId) {
                console.log("No destinationId provided, skipping template fetch.");
                setIsLoadingTemplates(false);
                return;
            }
            setIsLoadingTemplates(true);
            try {
                const params = new URLSearchParams({
                    destination_id: destinationId,
                    is_public: "true",
                });
                const response = await fetch(`${API_ROUTES.ITINERARIES}?${params}`);
                if (!response.ok)
                    throw new Error("Failed to fetch itinerary templates");
                const data = await response.json();
                setTemplates(data.itineraries || []);
            }
            catch (error) {
                console.error("Error fetching itinerary templates:", error);
                toast({
                    title: "Error",
                    description: "Failed to load itinerary templates.",
                    variant: "destructive",
                });
            }
            finally {
                setIsLoadingTemplates(false);
            }
        }
        fetchTemplates();
    }, [destinationId, toast]);
    const getDayNumbers = () => Array.from({ length: durationDays }, (_, i) => i + 1);
    const handleManualItemChange = (e) => {
        const { name, value } = e.target;
        setManualItem(prev => (Object.assign(Object.assign({}, prev), { [name]: value })));
    };
    const handleManualItemSelectChange = (name, value) => {
        setManualItem(prev => (Object.assign(Object.assign({}, prev), { [name]: value })));
    };
    const handleAddPlace = async (placeToAdd) => {
        var _a, _b, _c, _d;
        if (!placeToAdd)
            return;
        const title = placeToAdd.name || placeToAdd.name || "Unnamed Place";
        const address = placeToAdd.address || placeToAdd.formatted_address;
        const latitude = placeToAdd.latitude || ((_b = (_a = placeToAdd.geometry) === null || _a === void 0 ? void 0 : _a.location) === null || _b === void 0 ? void 0 : _b.lat());
        const longitude = placeToAdd.longitude || ((_d = (_c = placeToAdd.geometry) === null || _c === void 0 ? void 0 : _c.location) === null || _d === void 0 ? void 0 : _d.lng());
        const place_id = placeToAdd.id || null;
        try {
            const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title,
                    address: address,
                    latitude: latitude,
                    longitude: longitude,
                    place_id: place_id,
                    day_number: selectedDayForAdd,
                    status: "suggested",
                }),
            });
            if (!response.ok)
                throw new Error("Failed to add place");
            const { item: newItem } = await response.json();
            setItemsByDay(prev => {
                var _a;
                const day = (_a = newItem.day_number) !== null && _a !== void 0 ? _a : 0;
                const currentDayItems = prev[day] || [];
                return Object.assign(Object.assign({}, prev), { [day]: [...currentDayItems, newItem] });
            });
            toast({ title: "Place Added", description: `${title} added to Day ${selectedDayForAdd}.` });
            setShowAddDialog(false);
            setSelectedGooglePlace(null);
        }
        catch (error) {
            console.error("Error adding place:", error);
            toast({
                title: "Error",
                description: "Failed to add place. Please try again.",
                variant: "destructive",
            });
        }
    };
    const handleSuggestPlace = async () => {
        try {
            const response = await fetch(API_ROUTES.PLACES, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(Object.assign(Object.assign({}, newPlaceSuggestion), { destination_id: destinationId })),
            });
            if (!response.ok)
                throw new Error("Failed to suggest place");
            toast({
                title: "Place Suggested",
                description: "Thanks! Your suggestion will be reviewed.",
            });
            setShowSuggestDialog(false);
            setNewPlaceSuggestion({
                name: "",
                description: "",
                category: "attraction",
                address: "",
                price_level: 1,
            });
        }
        catch (error) {
            console.error("Error suggesting place:", error);
            toast({
                title: "Error",
                description: "Failed to suggest place. Please try again.",
                variant: "destructive",
            });
        }
    };
    const handleScrapeUrl = async () => {
        if (!urlToScrape.trim()) {
            toast({ title: "URL Required", description: "Please enter a URL to scrape.", variant: "destructive" });
            return;
        }
        setIsScraping(true);
        setScrapeError(null);
        try {
            const response = await fetch(`/api/trips/${tripId}/itinerary/scrape-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: urlToScrape }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Failed to scrape URL (status ${response.status})`);
            }
            setManualItem(prev => (Object.assign(Object.assign({}, prev), { title: data.title || prev.title || urlToScrape, description: data.description || prev.description })));
            toast({ title: "Content Scraped!", description: "Details have been pre-filled below." });
        }
        catch (error) {
            console.error("Error scraping URL:", error);
            setScrapeError(error.message || "An unknown error occurred during scraping.");
            toast({ title: "Scraping Failed", description: error.message, variant: "destructive" });
        }
        finally {
            setIsScraping(false);
        }
    };
    const handleCreateManualItem = async () => {
        try {
            const cost = manualItem.estimated_cost ? parseFloat(manualItem.estimated_cost) : null;
            const duration = manualItem.duration_minutes ? parseInt(manualItem.duration_minutes, 10) : null;
            const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.assign(Object.assign({}, manualItem), { estimated_cost: cost, duration_minutes: duration, is_custom: true })),
            });
            if (!response.ok)
                throw new Error("Failed to create manual item");
            const { item: newItem } = await response.json();
            setItemsByDay(prev => {
                var _a;
                const day = (_a = newItem.day_number) !== null && _a !== void 0 ? _a : 0;
                const currentDayItems = prev[day] || [];
                return Object.assign(Object.assign({}, prev), { [day]: [...currentDayItems, newItem] });
            });
            toast({ title: "Item Created", description: `${manualItem.title} added to Day ${manualItem.day_number}.` });
            setShowManualAddDialog(false);
            setManualItem({
                title: "",
                description: "",
                day_number: 1,
                start_time: "",
                end_time: "",
                estimated_cost: "",
                currency: "USD",
                duration_minutes: "",
            });
            setUrlToScrape("");
            setScrapeError(null);
        }
        catch (error) {
            console.error("Error creating manual item:", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };
    const handleApplyTemplate = async (template) => {
        console.log("Applying template:", template.title);
        toast({ title: "Applying Template...", description: `Fetching items for ${template.title}` });
        try {
            // 1. Fetch template details (items)
            const templateDetailResponse = await fetch(API_ROUTES.ITINERARY_DETAILS(template.slug));
            if (!templateDetailResponse.ok) {
                throw new Error(`Failed to fetch details for template ${template.slug}`);
            }
            const templateData = await templateDetailResponse.json();
            const templateItems = (templateData === null || templateData === void 0 ? void 0 : templateData.items) || templateData || [];
            if (!Array.isArray(templateItems)) {
                console.error("Unexpected template detail format:", templateData);
                throw new Error("Could not parse items from template details.");
            }
            if (templateItems.length === 0) {
                toast({ title: "Template Empty", description: "This template has no items to add.", variant: "default" });
                return;
            }
            // 2. Iterate and add items to the current trip
            let addedCount = 0;
            let errorCount = 0;
            const results = await Promise.allSettled(templateItems.map((item) => {
                // Basic validation for core fields from template item
                if (!item.title) {
                    console.warn("Skipping template item due to missing title:", item);
                    errorCount++; // Count as error if essential info missing
                    return Promise.resolve({ ok: false, statusText: "Missing title" }); // Resolve promise to not break allSettled
                }
                const itemPayload = {
                    title: item.title,
                    description: item.description || "",
                    day_number: item.day_number || null,
                    start_time: item.start_time || null,
                    end_time: item.end_time || null,
                    // Adapt other fields as needed, e.g., category
                    latitude: item.latitude || null, // Use new latitude property
                    longitude: item.longitude || null, // Use new longitude property
                    address: item.address || null,
                    category: item.category || null,
                    // Make sure status is set correctly
                    status: "suggested",
                };
                return fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(itemPayload),
                });
            }));
            // Process results, excluding promises resolved due to missing titles
            results.forEach(result => {
                var _a;
                if (result.status === 'fulfilled') {
                    // Check if it was a successful fetch (ok=true) or our skipped item (ok=false)
                    if (result.value.ok) {
                        addedCount++;
                    }
                    else if (result.value.statusText !== "Missing title") {
                        // Handle actual fetch errors
                        errorCount++;
                        console.error("Failed to add item:", (_a = result.value) === null || _a === void 0 ? void 0 : _a.statusText);
                    }
                }
                else if (result.status === 'rejected') {
                    // Handle rejected promises (network errors, etc.)
                    errorCount++;
                    console.error("Failed to add item (Promise rejected):", result.reason);
                }
            });
            // 3. Show results and refresh
            if (addedCount > 0 || errorCount > 0) {
                let description = "";
                if (addedCount > 0)
                    description += `${addedCount} items added as suggestions. `;
                if (errorCount > 0)
                    description += `${errorCount} failed or were skipped.`;
                toast({
                    title: addedCount > 0 ? "Template Items Processed" : "Template Item Errors",
                    description: description.trim(),
                    variant: addedCount > 0 ? "default" : "destructive",
                });
                if (addedCount > 0) {
                    router.refresh(); // Refresh only if some items were successfully added
                }
            }
            // No toast if nothing happened (e.g., empty template was already handled)
        }
        catch (error) {
            console.error("Error applying template:", error);
            toast({
                title: "Error Applying Template",
                description: error instanceof Error ? error.message : "An unknown error occurred.",
                variant: "destructive",
            });
        }
    };
    const handleVote = async (itemId, dayNumber, voteType) => {
        const dayKey = dayNumber !== null && dayNumber !== void 0 ? dayNumber : 0;
        // Optimistic update
        setItemsByDay(prev => {
            var _a;
            const newDayItems = (_a = prev[dayKey]) === null || _a === void 0 ? void 0 : _a.map(item => {
                var _a, _b, _c, _d, _e;
                if (item.id === itemId) {
                    const currentVote = (_a = item.votes) === null || _a === void 0 ? void 0 : _a.userVote;
                    let newUp = (_c = (_b = item.votes) === null || _b === void 0 ? void 0 : _b.up) !== null && _c !== void 0 ? _c : 0;
                    let newDown = (_e = (_d = item.votes) === null || _d === void 0 ? void 0 : _d.down) !== null && _e !== void 0 ? _e : 0;
                    let newUserVote = voteType;
                    if (currentVote === voteType) {
                        newUserVote = null;
                        if (voteType === 'up')
                            newUp--;
                        else
                            newDown--;
                    }
                    else {
                        if (currentVote === 'up')
                            newUp--;
                        if (currentVote === 'down')
                            newDown--;
                        if (voteType === 'up')
                            newUp++;
                        else
                            newDown++;
                    }
                    return Object.assign(Object.assign({}, item), { votes: Object.assign(Object.assign({}, (item.votes || {})), { up: newUp, down: newDown, userVote: newUserVote }) });
                }
                return item;
            });
            return Object.assign(Object.assign({}, prev), { [dayKey]: newDayItems || [] });
        });
        try {
            const voteResponse = await fetch(API_ROUTES.ITINERARY_ITEM_VOTE(tripId, itemId), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ vote_type: voteType }),
            });
            if (!voteResponse.ok)
                throw new Error("Failed to record vote");
        }
        catch (error) {
            console.error("Error voting:", error);
            toast({ title: "Error Voting", description: error.message, variant: "destructive" });
            fetchItineraryItems();
        }
    };
    const handlePlaceSelectedForEdit = useCallback((place, googlePlaceDetails) => {
        console.log("Place selected for editing:", place, googlePlaceDetails);
        if (editingItemId) {
            setItemsByDay((currentItemsByDay) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
                let dayKeyToUpdate = null;
                let itemIndexToUpdate = -1;
                // Find the item's day and index
                // Use Object.keys for safer iteration over potentially sparse days
                for (const dayKey of Object.keys(currentItemsByDay)) {
                    const dayNum = Number(dayKey);
                    const index = (_a = currentItemsByDay[dayNum]) === null || _a === void 0 ? void 0 : _a.findIndex(item => item.id === editingItemId); // Add optional chaining
                    if (index !== -1 && index !== undefined) { // Check index is valid
                        dayKeyToUpdate = dayNum;
                        itemIndexToUpdate = index;
                        break;
                    }
                }
                if (dayKeyToUpdate === null || itemIndexToUpdate === -1) {
                    console.warn("Item to edit not found in state");
                    return currentItemsByDay; // Return current state if item not found
                }
                // Create a shallow copy of the day's items array
                const updatedDayItems = [...currentItemsByDay[dayKeyToUpdate]];
                // Get the item to update
                const itemToUpdate = updatedDayItems[itemIndexToUpdate];
                // Create the updated item object
                const updatedItem = Object.assign(Object.assign({}, itemToUpdate), { title: (_c = (_b = googlePlaceDetails === null || googlePlaceDetails === void 0 ? void 0 : googlePlaceDetails.name) !== null && _b !== void 0 ? _b : place === null || place === void 0 ? void 0 : place.name) !== null && _c !== void 0 ? _c : itemToUpdate.title, address: (_e = (_d = googlePlaceDetails === null || googlePlaceDetails === void 0 ? void 0 : googlePlaceDetails.formatted_address) !== null && _d !== void 0 ? _d : place === null || place === void 0 ? void 0 : place.address) !== null && _e !== void 0 ? _e : itemToUpdate.address, latitude: (_j = (_h = (_g = (_f = googlePlaceDetails === null || googlePlaceDetails === void 0 ? void 0 : googlePlaceDetails.geometry) === null || _f === void 0 ? void 0 : _f.location) === null || _g === void 0 ? void 0 : _g.lat()) !== null && _h !== void 0 ? _h : place === null || place === void 0 ? void 0 : place.latitude) !== null && _j !== void 0 ? _j : itemToUpdate.latitude, longitude: (_o = (_m = (_l = (_k = googlePlaceDetails === null || googlePlaceDetails === void 0 ? void 0 : googlePlaceDetails.geometry) === null || _k === void 0 ? void 0 : _k.location) === null || _l === void 0 ? void 0 : _l.lng()) !== null && _m !== void 0 ? _m : place === null || place === void 0 ? void 0 : place.longitude) !== null && _o !== void 0 ? _o : itemToUpdate.longitude, place_id: (_p = place === null || place === void 0 ? void 0 : place.id) !== null && _p !== void 0 ? _p : itemToUpdate.place_id });
                // Update the item in the copied array
                updatedDayItems[itemIndexToUpdate] = updatedItem;
                // Return the new state object with the updated day array
                return Object.assign(Object.assign({}, currentItemsByDay), { [dayKeyToUpdate]: updatedDayItems });
            });
        }
        else {
            console.warn("Edit autocomplete triggered but no item is being edited.");
        }
    }, [editingItemId]); // Dependency is only editingItemId
    const handleGooglePlaceSelectedForAdd = (place, googlePlaceDetails) => {
        console.log("Google Place selected for adding:", googlePlaceDetails);
        setSelectedGooglePlace(googlePlaceDetails !== null && googlePlaceDetails !== void 0 ? googlePlaceDetails : null);
        // We don't need the internal 'place' object here as we're adding directly from Google
    };
    const handleAddGooglePlace = async () => {
        var _a, _b, _c, _d;
        if (!selectedGooglePlace) {
            toast({ title: "No Place Selected", description: "Please select a place.", variant: "destructive" });
            return;
        }
        const placeData = {
            title: selectedGooglePlace.name,
            address: selectedGooglePlace.formatted_address,
            latitude: (_b = (_a = selectedGooglePlace.geometry) === null || _a === void 0 ? void 0 : _a.location) === null || _b === void 0 ? void 0 : _b.lat(),
            longitude: (_d = (_c = selectedGooglePlace.geometry) === null || _c === void 0 ? void 0 : _c.location) === null || _d === void 0 ? void 0 : _d.lng(),
            status: "suggested",
            day_number: selectedDayForAdd, // Use the selected day
        };
        try {
            const response = await fetch(API_ROUTES.TRIP_ITINERARY(tripId), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(placeData),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Failed to add Google Place: ${errorData.error || response.statusText}`);
            }
            const { item: newItem } = await response.json();
            // Correctly update itemsByDay state
            setItemsByDay(prev => {
                var _a;
                const dayKey = (_a = newItem.day_number) !== null && _a !== void 0 ? _a : 0;
                const currentDayItems = prev[dayKey] || [];
                return Object.assign(Object.assign({}, prev), { [dayKey]: [...currentDayItems, newItem] }); // Add to correct day array
            });
            toast({
                title: "Place Added",
                description: `${selectedGooglePlace.name} added to Day ${selectedDayForAdd}.`, // Updated description
            });
            setSelectedGooglePlace(null);
            setShowAddDialog(false); // Close the add dialog
            setSelectedPlace(null); // Clear other selection if necessary
        }
        catch (error) {
            console.error("Error adding Google Place:", error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };
    const handleSaveEdit = async (itemId) => {
        const itemToSave = Object.values(itemsByDay).flat().find(i => i.id === itemId);
        if (!itemToSave)
            return;
        // Find the specific changes made (compare itemToSave with inlineEditValue if only title is inline editable)
        // Assuming inlineEditValue holds the updated title
        const updateData = {
            title: inlineEditValue
            // Add other fields if they are part of inline edit
        };
        // Avoid saving if no changes were made
        if (updateData.title === itemToSave.title) {
            setEditingItemId(null); // Exit edit mode without saving
            return;
        }
        setEditingItemId(null); // Exit edit mode optimistically
        try {
            const response = await fetch(API_ROUTES.ITINERARY_ITEM(tripId, itemId), {
                method: 'PATCH', // or PUT
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });
            if (!response.ok)
                throw new Error("Failed to save changes");
            // Update local state with saved data (response might contain full updated item)
            const savedItem = await response.json();
            setItemsByDay(prev => {
                var _a;
                const dayKey = (_a = savedItem.item.day_number) !== null && _a !== void 0 ? _a : 0;
                return Object.assign(Object.assign({}, prev), { [dayKey]: (prev[dayKey] || []).map(i => i.id === itemId ? savedItem.item : i) });
            });
            toast({ title: "Changes Saved" });
        }
        catch (error) {
            console.error("Error saving item:", error);
            toast({ title: "Error Saving", description: error instanceof Error ? error.message : String(error), variant: "destructive" });
            // Optionally revert optimistic update or refetch
            fetchItineraryItems();
        }
    };
    // Define handlers needed by ItineraryItemCard
    const handleStartInlineEdit = (item) => {
        setEditingItemId(item.id);
        setInlineEditValue(item.title); // Or fetch fresh data if needed
    };
    const handleInlineEditChange = (e) => {
        setInlineEditValue(e.target.value);
    };
    const handleInlineInputBlur = () => {
        // Optionally save on blur, or rely on Enter key / save button
        // For now, just check if value is same as original, if so, cancel edit
        const originalItem = Object.values(itemsByDay).flat().find(i => i.id === editingItemId);
        if (originalItem && inlineEditValue === originalItem.title) {
            setEditingItemId(null);
        }
        else {
            // If different, maybe trigger save? Or let handleSaveEdit handle it.
            // handleSaveEdit(editingItemId!);
        }
        // Or simply: setEditingItemId(null); // To cancel edit on blur if no save action desired
    };
    const handleDeleteItem = async (itemId) => {
        // ... (existing implementation)
    };
    // Render single itinerary item
    // Restore props destructuring
    const ItineraryItemCard = ({ item, dayNumber, editingItemId, inlineEditValue, onStartInlineEdit, onInlineEditChange, onInlineInputBlur, onSaveEdit, onDeleteItem }) => {
        const ref = useRef(null);
        // ... dnd setup ...
        // Use passed editingItemId prop
        const isEditing = editingItemId === item.id;
        return (<div className="mb-2 bg-background p-3 rounded-lg shadow-sm border relative group" ref={ref}>
        <div className="flex justify-between items-start">
           <div className="flex-1 pr-2">
              {/* Use isEditing based on prop */}
              {isEditing ? (<Input value={inlineEditValue} // Use prop
             onChange={onInlineEditChange} // Use prop
             onBlur={onInlineInputBlur} // Use prop (simple cancel/check)
             onKeyDown={(e) => e.key === 'Enter' && onSaveEdit(item.id)} // Use prop
             autoFocus className="h-8 text-base font-semibold"/>) : (<p className="font-semibold cursor-pointer" onClick={() => onStartInlineEdit(item)} // Use prop
            >
                        {item.title}
                    </p>)}
              {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
              {item.address && <p className="text-sm flex items-center mt-1"><MapPin className="w-3 h-3 mr-1"/> {item.address}</p>}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mt-2">
                  {item.start_time && (<span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {item.start_time}{item.end_time ? ` - ${item.end_time}` : ''}{item.duration_minutes && ` (${item.duration_minutes} min)`}</span>)}
                  {item.estimated_cost && (<span className="flex items-center"><DollarSign className="w-3 h-3 mr-1"/> {item.estimated_cost} {item.currency || ''}</span>)}
              </div>
           </div>
           <div className="pl-2 flex flex-col items-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => { onStartInlineEdit(item); }} className="h-7 w-7 opacity-0 group-hover:opacity-100">
                    <Edit className="w-4 h-4"/>
                </Button>
           </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onDeleteItem(item.id)} // Use prop
         className="h-7 w-7 opacity-0 group-hover:opacity-100">
            <Trash2 className="w-4 h-4 text-destructive"/>
        </Button>
      </div>);
    };
    // Render a drop zone for a specific day
    const DayDropZone = ({ dayNumber }) => {
        const ref = useRef(null);
        const [{ isOver, canDrop }, drop] = useDrop(() => ({
            accept: ItemTypes.ITINERARY_ITEM,
            drop: (item) => {
                console.log(`Dropped item ${item.id} from day ${item.dayNumber} onto day ${dayNumber}`);
                if (item.dayNumber !== dayNumber) {
                    moveItem(item.id, null, dayNumber);
                }
                return { moved: true };
            },
            canDrop: (item) => item.dayNumber !== dayNumber,
            collect: (monitor) => ({
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }), [dayNumber, moveItem]);
        const isActive = isOver && canDrop;
        drop(ref);
        return (<div ref={ref} className={`p-4 border rounded-lg min-h-[150px] transition-colors ${isActive ? 'bg-primary/10 border-primary' : 'bg-background border-border'}`}>
              <h2 className="text-xl font-semibold mb-4 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10 border-b">Day {dayNumber}</h2>
              <div className="space-y-4">
                 {(itemsByDay[dayNumber] || []).map((item) => (<ItineraryItemCard key={item.id} item={item} dayNumber={dayNumber} editingItemId={editingItemId} inlineEditValue={inlineEditValue} onStartInlineEdit={handleStartInlineEdit} onInlineEditChange={handleInlineEditChange} onInlineInputBlur={handleInlineInputBlur} onSaveEdit={handleSaveEdit} onDeleteItem={handleDeleteItem}/>))}
                {(!itemsByDay[dayNumber] || itemsByDay[dayNumber].length === 0) && (<p className="text-muted-foreground italic text-center py-6">Drop items here or add new ones for Day {dayNumber}.</p>)}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => {
                setSelectedDayForAdd(dayNumber);
                setShowAddDialog(true);
            }}>
                   <PlusCircle className="w-4 h-4 mr-2"/> Add Place/Activity to Day {dayNumber}
              </Button>
          </div>);
    };
    // Unscheduled Items Section
    const unscheduledItems = itemsByDay[0] || [];
    // ... UnscheduledDropZone (if exists) or direct render ...
    {
        unscheduledItems.length > 0 && (<div className="p-4 border rounded-lg border-dashed mt-6">
          <h2 className="text-lg font-semibold mb-2 text-muted-foreground">Unassigned Items</h2>
          <div className="space-y-4">
            {unscheduledItems.map(item => (
            // Pass all required props correctly
            <ItineraryItemCard key={item.id} item={item} dayNumber={0} editingItemId={editingItemId} inlineEditValue={inlineEditValue} onStartInlineEdit={handleStartInlineEdit} onInlineEditChange={handleInlineEditChange} onInlineInputBlur={handleInlineInputBlur} onSaveEdit={handleSaveEdit} onDeleteItem={handleDeleteItem}/>))}
           </div>
        </div>);
    }
    return (<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                 <Dialog open={showManualAddDialog} onOpenChange={(open) => {
            setShowManualAddDialog(open);
            if (!open) {
                setManualItem({ title: "", description: "", day_number: 1, start_time: "", end_time: "", estimated_cost: "", currency: "USD", duration_minutes: "" });
                setUrlToScrape("");
                setScrapeError(null);
                setIsScraping(false);
            }
        }}>
                   <DialogTrigger asChild>
                      <Button variant="outline" className="flex-1 gap-1">
                         <Plus className="h-4 w-4"/> Manual Entry
                      </Button>
                   </DialogTrigger>
                   <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Custom Itinerary Item</DialogTitle>
                        <DialogDescription>
                          Manually add an activity, meal, flight, or anything else. You can also paste a URL to try and auto-fill details.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                         <div className="grid gap-2">
                              <Label htmlFor="scrape-url">Import from URL (Optional)</Label>
                              <div className="flex items-center gap-2">
                                  <Input id="scrape-url" placeholder="https://example.com/attraction" value={urlToScrape} onChange={(e) => setUrlToScrape(e.target.value)} disabled={isScraping}/>
                                  <Button onClick={handleScrapeUrl} disabled={isScraping || !urlToScrape} size="icon" variant="outline">
                                      {isScraping ? <Loader2 className="h-4 w-4 animate-spin"/> : <LinkIcon className="h-4 w-4"/>}
                                      <span className="sr-only">Scrape URL</span>
                                  </Button>
                              </div>
                               {scrapeError && <p className="text-xs text-destructive">{scrapeError}</p>}
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="manual-title">Title*</Label>
                            <Input id="manual-title" name="title" value={manualItem.title} onChange={handleManualItemChange} required/>
                          </div>
                          <div className="grid gap-2">
                             <Label htmlFor="manual-description">Description</Label>
                             <Textarea id="manual-description" name="description" value={manualItem.description || ""} onChange={handleManualItemChange}/>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="manual-day">Day</Label>
                                <Select name="day_number" value={String(manualItem.day_number)} onValueChange={(value) => handleManualItemSelectChange('day_number', Number(value))}>
                                  <SelectTrigger id="manual-day"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {getDayNumbers().map(day => (<SelectItem key={day} value={String(day)}>Day {day}</SelectItem>))}
                                    <SelectItem value="0">Unscheduled</SelectItem> 
                                  </SelectContent>
                                </Select>
                             </div>
                             <div className="grid gap-2">
                                 <Label htmlFor="manual-duration">Duration (mins)</Label>
                                 <Input id="manual-duration" name="duration_minutes" type="number" min="0" value={manualItem.duration_minutes || ""} onChange={handleManualItemChange}/>
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label htmlFor="manual-start">Start Time</Label>
                                <Input id="manual-start" name="start_time" type="time" value={manualItem.start_time || ""} onChange={handleManualItemChange}/>
                             </div>
                             <div className="grid gap-2">
                                <Label htmlFor="manual-end">End Time</Label>
                                <Input id="manual-end" name="end_time" type="time" value={manualItem.end_time || ""} onChange={handleManualItemChange}/>
                             </div>
                          </div>
                           <div className="grid grid-cols-2 gap-4">
                               <div className="grid gap-2">
                                  <Label htmlFor="manual-cost">Est. Cost</Label>
                                  <Input id="manual-cost" name="estimated_cost" type="number" min="0" step="0.01" placeholder="0.00" value={manualItem.estimated_cost || ""} onChange={handleManualItemChange}/>
                              </div>
                               <div className="grid gap-2">
                                  <Label htmlFor="manual-currency">Currency</Label>
                                  <Select name="currency" value={manualItem.currency} onValueChange={(value) => handleManualItemSelectChange('currency', value)}>
                                      <SelectTrigger id="manual-currency"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="USD">USD</SelectItem>
                                          <SelectItem value="EUR">EUR</SelectItem>
                                          <SelectItem value="GBP">GBP</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                           </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowManualAddDialog(false)}>Cancel</Button>
                        <Button onClick={handleCreateManualItem} disabled={!manualItem.title}>Add Manual Item</Button>
                      </DialogFooter>
                   </DialogContent>
                 </Dialog>
              </div>
              
              <div className="flex gap-2 pt-2">
                  <Input placeholder="Search places..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
              </div>
          </div>

          <div className="md:col-span-2 space-y-6">
              <Tabs defaultValue="suggested">
                  <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="suggested">Suggested</TabsTrigger>
                      <TabsTrigger value="templates">Templates</TabsTrigger>
                      <TabsTrigger value="custom">Custom</TabsTrigger>
                  </TabsList>

                  <TabsContent value="suggested" className="mt-4">
                      <Card>
                          <CardHeader>
                              <CardTitle>Suggested Places</CardTitle>
                              <CardDescription>Based on destination and filters.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              {isLoadingPlaces ? (<div className="space-y-2 mt-2">
                                      <Skeleton className="h-10 w-full"/>
                                      <Skeleton className="h-10 w-full"/>
                                      <Skeleton className="h-10 w-full"/>
                                  </div>) : (<ScrollArea className="h-[calc(100vh-var(--navbar-height)-25rem)]">
                                      {places.length > 0 ? places.map(place => (<div key={place.id} className="p-2 border-b hover:bg-muted flex justify-between items-center gap-2">
                                              <div className="flex-grow min-w-0">
                                                  <p className="font-medium truncate">{place.name}</p>
                                                  <p className="text-xs text-muted-foreground truncate">{place.address}</p>
                                              </div>
                                              <Button size="sm" variant="outline" onClick={() => {
                    // Directly call handleAddPlace with the local Place object
                    setSelectedDayForAdd(1); // Or prompt for day
                    setShowAddDialog(true);
                    // Instead of setting selectedPlace, maybe pass the place to the dialog?
                    // Or, modify handleAddPlace/dialog to work directly with the ID?
                    // For now, let's just ensure we don't call setSelectedPlace(place)
                    // If the dialog needs the place, pass it differently.
                    // If Add button in dialog triggers add, ensure it uses this 'place'
                    // Let's assume setShowAddDialog is enough for now and dialog handles it.
                }}>Add</Button>
                                          </div>)) : (<p className="text-sm text-muted-foreground text-center py-4">No places found matching your criteria.</p>)}
                                  </ScrollArea>)}
                          </CardContent>
                      </Card>
                  </TabsContent>

                  <TabsContent value="templates" className="mt-4"> 
                      <Card>
                          <CardHeader>
                              <CardTitle>Itinerary Templates</CardTitle>
                              <CardDescription>Apply a template to get started.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              {isLoadingTemplates ? (<div className="space-y-2 mt-2">
                                      <Skeleton className="h-10 w-full"/>
                                      <Skeleton className="h-10 w-full"/>
                                  </div>) : (<ScrollArea className="h-[calc(100vh-var(--navbar-height)-20rem)]"> 
                                      {templates.length > 0 ? templates.map(template => (<div key={template.id} className="p-2 border-b hover:bg-muted flex justify-between items-center gap-2">
                                              <p className="font-medium truncate flex-grow">{template.title}</p> 
                                              <Button size="sm" variant="outline" onClick={() => handleApplyTemplate(template)} className="flex-shrink-0">Apply</Button>
                                          </div>)) : <p className="text-sm text-muted-foreground text-center py-4">No relevant templates found.</p>}
                                  </ScrollArea>)}
                          </CardContent>
                      </Card>
                  </TabsContent>

                  <TabsContent value="custom" className="mt-4"> 
                      <Card>
                          <CardHeader>
                              <CardTitle>Add Custom/Search</CardTitle>
                              <CardDescription>Manually add items or search Google Maps.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <Button className="w-full" onClick={() => {
            setManualItem({ title: "", description: "", day_number: 1, start_time: "", end_time: "", estimated_cost: "", currency: "USD", duration_minutes: "" });
            setShowManualAddDialog(true);
        }}> 
                                  <Plus className="w-4 h-4 mr-2"/> Add Custom Itinerary Item
                              </Button>
                              
                              <div className="pt-2">
                                  <Label>Add from Google Maps</Label>
                                  <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                                      <PlaceAutocomplete onPlaceSelect={(place, googlePlaceDetails) => {
            if (googlePlaceDetails && typeof googlePlaceDetails === 'object' && googlePlaceDetails.place_id) {
                const result = googlePlaceDetails;
                console.log("Received Google Place Result:", result); // Log for debugging
                // setSelectedGooglePlace(result); // *** Temporarily Commented Out ***
                setSelectedPlace(null);
                setSelectedDayForAdd(1);
                // Decide if we still show the Add dialog without setting state yet
                // setShowAddDialog(true); // Maybe comment this too for now
            }
            else {
                setSelectedGooglePlace(null);
            }
        }}/>
                                  </APIProvider>
                                  {/* ... Selected Google Place display ... */} 
                              </div>
                          </CardContent>
                      </Card>
                  </TabsContent>
              </Tabs>

              {isLoadingItineraryItems ? (<div className="space-y-4">
                      <Skeleton className="h-8 w-1/4"/>
                      <Skeleton className="h-20 w-full"/>
                      <Skeleton className="h-20 w-full"/>
                  </div>) : (<div className="space-y-6">
                      <DayDropZone key={0} dayNumber={0}/>
                      {getDayNumbers().map(day => (<DayDropZone key={day} dayNumber={day}/>))}
                  </div>)}
          </div>
        </div>
      </DndProvider>
    </APIProvider>);
}
