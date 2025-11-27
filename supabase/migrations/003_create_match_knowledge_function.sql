create or replace function match_knowledge(
  query_embedding vector(1536),
  match_count int default 5,
  similarity_threshold double precision default 0.75
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
as $$
  select
    knowledge.id,
    knowledge.content,
    knowledge.metadata,
    1 - (knowledge.embedding <=> query_embedding) as similarity
  from knowledge
  where knowledge.embedding is not null
    and 1 - (knowledge.embedding <=> query_embedding) >= similarity_threshold
  order by knowledge.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
