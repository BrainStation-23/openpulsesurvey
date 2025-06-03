
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { getLoginHistory } from '@/services/loginTracking';
import { format } from 'date-fns';
import { Monitor, Smartphone, Tablet, Globe, Wifi, WifiOff } from 'lucide-react';

interface LoginHistoryEntry {
  id: string;
  email: string;
  login_method: string;
  success: boolean;
  error_message?: string;
  ip_address?: string;
  device_info: any;
  network_info: any;
  location_info: any;
  created_at: string;
}

export function LoginHistory() {
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadHistory();
  }, [page]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getLoginHistory(page, 10);
      setHistory(data || []);
    } catch (error) {
      console.error('Failed to load login history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceInfo: any) => {
    const type = deviceInfo?.device?.type?.toLowerCase();
    if (type === 'mobile') return <Smartphone className="h-4 w-4" />;
    if (type === 'tablet') return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getLoginMethodBadge = (method: string) => {
    const variants: Record<string, any> = {
      email_password: 'default',
      magic_link: 'secondary',
      oauth_azure: 'outline',
      oauth_google: 'outline',
    };
    
    const labels: Record<string, string> = {
      email_password: 'Email/Password',
      magic_link: 'Magic Link',
      oauth_azure: 'Microsoft',
      oauth_google: 'Google',
    };

    return (
      <Badge variant={variants[method] || 'default'}>
        {labels[method] || method}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login History</CardTitle>
        <CardDescription>Recent login attempts and device information</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Network</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {format(new Date(entry.created_at), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(entry.created_at), 'hh:mm a')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getLoginMethodBadge(entry.login_method)}
                </TableCell>
                <TableCell>
                  <Badge variant={entry.success ? 'default' : 'destructive'}>
                    {entry.success ? 'Success' : 'Failed'}
                  </Badge>
                  {!entry.success && entry.error_message && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {entry.error_message}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(entry.device_info)}
                    <div>
                      <div className="font-medium text-sm">
                        {entry.device_info?.browser?.name} {entry.device_info?.browser?.version}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.device_info?.os?.name} {entry.device_info?.os?.version}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span className="text-sm">{entry.ip_address || 'Unknown'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.device_info?.timezone || 'Unknown timezone'}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {entry.network_info?.online ? (
                      <Wifi className="h-3 w-3 text-green-500" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-sm">
                      {entry.network_info?.connection?.effectiveType || 'Unknown'}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {history.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No login history found</p>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={history.length < 10}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
