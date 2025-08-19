-- Check if trigger exists for profile creation and update it
-- First, let's create or replace the function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles table with user metadata
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role,
    company_id
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'client')::user_role,
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'role', 'client')::user_role = 'company' THEN new.id
      ELSE NULL
    END
  );

  -- Insert into role-specific tables based on user role
  CASE COALESCE(new.raw_user_meta_data->>'role', 'client')
    WHEN 'advocate' THEN
      INSERT INTO public.advocates (id, bar_number) 
      VALUES (new.id, new.raw_user_meta_data->>'bar_number');
    
    WHEN 'company' THEN
      INSERT INTO public.companies (id, company_name) 
      VALUES (new.id, COALESCE(new.raw_user_meta_data->>'company_name', 'Unnamed Company'));
    
    WHEN 'client' THEN
      INSERT INTO public.clients (id) 
      VALUES (new.id);
    
    ELSE
      -- Default to client for any other role
      INSERT INTO public.clients (id) 
      VALUES (new.id);
  END CASE;

  RETURN new;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();