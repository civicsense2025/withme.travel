'use client';

import React, { useState, useEffect } from 'react';
import { API_ROUTES } from '@/utils/constants/routes';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/ui/tag-input';
import { LocationSearch } from '@/components/location-search';
import { format } from 'date-fns';
import { Tag } from '@/types/tag';
import { ItineraryTab } from '@/components/itinerary/itinerary-tab';
import { MembersTab, TripMemberFromSSR } from '@/components/members-tab';
import { DisplayItineraryItem, ItinerarySection, ItemStatus } from '@/types/itinerary';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Pencil } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { Profile } from '@/types/profile';
import { TripRole } from '@/types/trip';
import * as z from 'zod';

// ... (rest of the code as in the source file) ... 