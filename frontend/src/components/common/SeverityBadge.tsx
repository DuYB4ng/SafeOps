import { Badge } from '@/components/ui/badge';
import type { IncidentPriority } from '@/types/enums';

export function SeverityBadge({
  priority,
  className,
}: {
  priority: IncidentPriority;
  className?: string;
}) {
  return (
    <Badge
      variant={priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical'}
      className={className}
    >
      {priority}
    </Badge>
  );
}
