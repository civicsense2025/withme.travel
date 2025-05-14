/**
 * Updates a destination entity with the given data
 * @param entityId The ID of the destination to update
 * @param data The data to update the destination with
 * @returns A boolean indicating whether the update was successful
 */
export async function updateDestination(
  entityId: string,
  data: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/destinations/${entityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to update destination: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error updating destination:', error);
    throw error;
  }
}

/**
 * Updates a country entity with the given data
 * @param countryName The name of the country to update
 * @param data The data to update the country with
 * @returns A boolean indicating whether the update was successful
 */
export async function updateCountry(
  countryName: string,
  data: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/countries/${encodeURIComponent(countryName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to update country: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error updating country:', error);
    throw error;
  }
}

/**
 * Updates a continent entity with the given data
 * @param continentName The name of the continent to update
 * @param data The data to update the continent with
 * @returns A boolean indicating whether the update was successful
 */
export async function updateContinent(
  continentName: string,
  data: Record<string, any>
): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/continents/${encodeURIComponent(continentName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Failed to update continent: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error updating continent:', error);
    throw error;
  }
}

/**
 * Generic function to update any entity type
 * @param entityType The type of entity to update
 * @param entityId The ID or name of the entity to update
 * @param data The data to update the entity with
 * @returns A boolean indicating whether the update was successful
 */
export async function updateEntity(
  entityType: 'destination' | 'country' | 'continent',
  entityId: string,
  data: Record<string, any>
): Promise<boolean> {
  switch (entityType) {
    case 'destination':
      return updateDestination(entityId, data);
    case 'country':
      return updateCountry(entityId, data);
    case 'continent':
      return updateContinent(entityId, data);
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }
}
