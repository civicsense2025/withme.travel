SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'form%' ORDER BY tablename;
