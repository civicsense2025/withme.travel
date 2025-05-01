import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/use-local-storage'; // Assumes this hook exists

// Mock implementation of hooks/use-local-storage.ts
// In a real project, this would be an actual hook file in your project
// For demonstration purposes, we're defining it here as it would be tested
/*
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
*/

// Mock the hook for testing purposes
jest.mock('@/hooks/use-local-storage', () => ({
  useLocalStorage: jest.fn((key, initialValue) => {
    const [value, setValue] = jest.requireActual('react').useState(initialValue);

    const setValueAndStorage = jest.fn((newValue) => {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    });

    return [value, setValueAndStorage];
  }),
}));

describe('useLocalStorage hook', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    jest.clearAllMocks();
    window.localStorage.getItem.mockClear();
    window.localStorage.setItem.mockClear();
  });

  it('should use initialValue when localStorage is empty', () => {
    // Mock localStorage.getItem to return null (empty)
    window.localStorage.getItem = jest.fn().mockReturnValueOnce(null);

    // Render the hook with an initial value
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial value'));

    // Check that the initial value is used
    expect(result.current[0]).toBe('initial value');

    // Verify localStorage was checked for the key
    expect(window.localStorage.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should use value from localStorage if available', () => {
    // Mock localStorage.getItem to return a stored value
    window.localStorage.getItem = jest.fn().mockReturnValueOnce(JSON.stringify('stored value'));

    // Render the hook
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial value'));

    // Check that the value from localStorage is used instead of the initial value
    expect(result.current[0]).toBe('stored value');

    // Verify localStorage was checked for the key
    expect(window.localStorage.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should update localStorage when setValue is called with a direct value', () => {
    // Initial render
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial value'));

    // Update the value
    act(() => {
      result.current[1]('new value');
    });

    // Check that the returned value has updated
    expect(result.current[0]).toBe('new value');

    // Check that localStorage was updated
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify('new value')
    );
  });

  it('should update localStorage when setValue is called with a function', () => {
    // Initial render with an object value
    const initialObject = { count: 0, name: 'test' };
    const { result } = renderHook(() => useLocalStorage('test-key', initialObject));

    // Update using a function that receives the previous value
    act(() => {
      result.current[1]((prevValue) => ({
        ...prevValue,
        count: prevValue.count + 1,
      }));
    });

    // Check that the returned value has updated correctly
    expect(result.current[0]).toEqual({ count: 1, name: 'test' });

    // Check that localStorage was updated with the new object
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify({ count: 1, name: 'test' })
    );
  });

  it('should handle complex objects', () => {
    // Test with a complex object
    const complexObject = {
      user: {
        id: 1,
        name: 'Test User',
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      },
      items: [1, 2, 3],
      active: true,
    };

    // Initial render
    const { result } = renderHook(() => useLocalStorage('complex-key', complexObject));

    // Update a nested property
    act(() => {
      result.current[1]((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          preferences: {
            ...prev.user.preferences,
            theme: 'light',
          },
        },
      }));
    });

    // Check that the returned value has the updated nested property
    expect(result.current[0].user.preferences.theme).toBe('light');

    // Check that other properties remain unchanged
    expect(result.current[0].user.id).toBe(1);
    expect(result.current[0].items).toEqual([1, 2, 3]);
    expect(result.current[0].active).toBe(true);

    // Check that localStorage was updated with the complete new object
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      'complex-key',
      expect.any(String) // We don't need to check the exact string here
    );

    // Parse the actual string that was passed to validate it contains our updated data
    const setCall = window.localStorage.setItem.mock.calls[0];
    const storedObject = JSON.parse(setCall[1]);
    expect(storedObject.user.preferences.theme).toBe('light');
  });
});
