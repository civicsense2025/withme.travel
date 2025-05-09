-- SQL to add foreign key from destinations to cities
ALTER TABLE public.destinations ADD COLUMN city_id uuid;
ALTER TABLE public.destinations ADD CONSTRAINT fk_destinations_city FOREIGN KEY (city_id) REFERENCES public.cities(id) ON DELETE SET NULL;
CREATE INDEX idx_destinations_city_id ON public.destinations(city_id);
