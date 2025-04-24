"use client";
import { useEffect, useState } from "react";
import { API_ROUTES } from "@/utils/constants";
export function useTrips() {
    const [trips, setTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        async function fetchTrips() {
            try {
                const response = await fetch(API_ROUTES.TRIPS);
                if (!response.ok) {
                    throw new Error("Failed to fetch trips");
                }
                const data = await response.json();
                setTrips(data.trips || []);
            }
            catch (err) {
                setError(err instanceof Error ? err : new Error("Failed to fetch trips"));
            }
            finally {
                setIsLoading(false);
            }
        }
        fetchTrips();
    }, []);
    return { trips, isLoading, error };
}
