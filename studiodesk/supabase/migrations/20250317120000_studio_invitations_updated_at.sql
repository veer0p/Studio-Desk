-- studio_invitations.updated_at column and trigger (required by existing trigger or app updates)
ALTER TABLE public.studio_invitations
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.studio_invitations
SET updated_at = COALESCE(created_at, NOW())
WHERE updated_at IS NULL;

ALTER TABLE public.studio_invitations
  ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE public.studio_invitations
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- Function used by trigger (idempotent)
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_studio_invitations_updated_at ON public.studio_invitations;
CREATE TRIGGER trg_studio_invitations_updated_at
  BEFORE UPDATE ON public.studio_invitations
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
