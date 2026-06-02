-- Função usada no Dashboard: visitantes agrupados por dia
CREATE OR REPLACE FUNCTION visitors_by_day(days INT DEFAULT 14)
RETURNS TABLE(date TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC('day', visited_at AT TIME ZONE 'America/Fortaleza'), 'DD/MM') AS date,
    COUNT(*)::BIGINT AS count
  FROM visitors
  WHERE visited_at >= NOW() - (days || ' days')::INTERVAL
  GROUP BY DATE_TRUNC('day', visited_at AT TIME ZONE 'America/Fortaleza')
  ORDER BY DATE_TRUNC('day', visited_at AT TIME ZONE 'America/Fortaleza');
END;
$$ LANGUAGE plpgsql;
