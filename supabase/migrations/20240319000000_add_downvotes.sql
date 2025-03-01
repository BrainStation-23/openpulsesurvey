
-- Create the issue_downvotes table
CREATE TABLE IF NOT EXISTS public.issue_downvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(issue_id, user_id)
);

-- Add downvote_count to issues table
ALTER TABLE public.issues
ADD COLUMN IF NOT EXISTS downvote_count INTEGER NOT NULL DEFAULT 0;

-- Create trigger to update downvote count
CREATE OR REPLACE FUNCTION public.update_issue_downvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    UPDATE public.issues
    SET downvote_count = (
      SELECT COUNT(*)
      FROM public.issue_downvotes
      WHERE issue_id = OLD.issue_id
    )
    WHERE id = OLD.issue_id;
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    UPDATE public.issues
    SET downvote_count = (
      SELECT COUNT(*)
      FROM public.issue_downvotes
      WHERE issue_id = NEW.issue_id
    )
    WHERE id = NEW.issue_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER issue_downvote_count_trigger
AFTER INSERT OR DELETE ON public.issue_downvotes
FOR EACH ROW
EXECUTE FUNCTION public.update_issue_downvote_count();
