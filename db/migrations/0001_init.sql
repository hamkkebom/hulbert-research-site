-- 0001: posts table for the column (blog) CMS, and login attempt log for rate limiting.

CREATE TABLE posts (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug          text        NOT NULL UNIQUE
                CHECK (length(slug) BETWEEN 1 AND 120 AND slug ~ '^[a-z0-9가-힣]+(-[a-z0-9가-힣]+)*$'),
  title         text        NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  summary       text        NOT NULL DEFAULT '' CHECK (length(summary) <= 500),
  content_mdx   text        NOT NULL DEFAULT '',
  category      text        NOT NULL DEFAULT '',
  tags          text[]      NOT NULL DEFAULT '{}',
  author_name   text        NOT NULL,
  faq_json      jsonb       NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(faq_json) = 'array'),
  status        text        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (status = 'draft' OR published_at IS NOT NULL)
);

CREATE INDEX posts_published_idx ON posts (published_at DESC) WHERE status = 'published';

-- published_at is the first publication time: set once, never changed afterwards.
-- updated_at follows every change.
CREATE FUNCTION posts_before_write() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.published_at IS NOT NULL AND NEW.published_at IS DISTINCT FROM OLD.published_at THEN
      RAISE EXCEPTION 'published_at is immutable once set';
    END IF;
    IF OLD.published_at IS NOT NULL AND NEW.slug IS DISTINCT FROM OLD.slug THEN
      RAISE EXCEPTION 'slug cannot change after first publication';
    END IF;
    NEW.created_at := OLD.created_at;
    NEW.updated_at := now();
  END IF;
  IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
    NEW.published_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER posts_before_write
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION posts_before_write();

CREATE TABLE auth_attempts (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip          text        NOT NULL,
  kind        text        NOT NULL CHECK (kind IN ('start', 'failure')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX auth_attempts_ip_time_idx ON auth_attempts (ip, created_at DESC);
