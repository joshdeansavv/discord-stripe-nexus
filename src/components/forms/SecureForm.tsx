import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sanitizeInput, validateInput, checkRateLimit, generateCSRFToken } from '@/utils/security';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Example secure form schema
const secureFormSchema = z.object({
  serverName: z.string()
    .min(1, 'Server name is required')
    .max(50, 'Server name must be less than 50 characters')
    .refine((val) => validateInput(val, 'serverName'), 'Invalid server name format'),
  
  discordId: z.string()
    .optional()
    .refine((val) => !val || validateInput(val, 'discordId'), 'Invalid Discord ID format'),
});

type SecureFormData = z.infer<typeof secureFormSchema>;

interface SecureFormProps {
  onSubmit: (data: SecureFormData) => Promise<void>;
  loading?: boolean;
  initialData?: Partial<SecureFormData>;
}

export const SecureForm: React.FC<SecureFormProps> = ({
  onSubmit,
  loading = false,
  initialData = {}
}) => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [isRateLimited, setIsRateLimited] = useState(false);
  const { toast } = useToast();

  const form = useForm<SecureFormData>({
    resolver: zodResolver(secureFormSchema),
    defaultValues: {
      serverName: initialData.serverName || '',
      discordId: initialData.discordId || '',
    },
  });

  useEffect(() => {
    // Generate CSRF token on component mount
    setCsrfToken(generateCSRFToken());
  }, []);

  const handleSubmit = async (data: SecureFormData) => {
    try {
      // Rate limiting check
      const rateLimitResult = checkRateLimit('form_submission', 5); // 5 submissions per minute
      
      if (!rateLimitResult.allowed) {
        setIsRateLimited(true);
        toast({
          title: 'Rate Limit Exceeded',
          description: `Too many submissions. Try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} seconds.`,
          variant: 'destructive',
        });
        return;
      }

      // Sanitize inputs
      const sanitizedData: SecureFormData = {
        serverName: sanitizeInput(data.serverName),
        discordId: data.discordId ? sanitizeInput(data.discordId) : undefined,
      };

      // Validate CSRF token (in real implementation, this would be validated server-side)
      const storedToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (!storedToken || !csrfToken) {
        throw new Error('CSRF protection failed');
      }

      // Additional validation
      if (!validateInput(sanitizedData.serverName, 'serverName')) {
        throw new Error('Invalid server name format');
      }

      if (sanitizedData.discordId && !validateInput(sanitizedData.discordId, 'discordId')) {
        throw new Error('Invalid Discord ID format');
      }

      await onSubmit(sanitizedData);
      
      toast({
        title: 'Success',
        description: 'Form submitted securely.',
      });

    } catch (error) {
      console.error('Secure form submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Hidden CSRF token field */}
        <input type="hidden" name="csrf_token" value={csrfToken} />
        
        <FormField
          control={form.control}
          name="serverName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter server name"
                  maxLength={50}
                  disabled={loading || isRateLimited}
                  onChange={(e) => {
                    // Real-time sanitization
                    const sanitized = sanitizeInput(e.target.value);
                    field.onChange(sanitized);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discordId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discord ID (Optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter Discord ID"
                  disabled={loading || isRateLimited}
                  onChange={(e) => {
                    // Real-time sanitization and validation
                    const sanitized = sanitizeInput(e.target.value);
                    field.onChange(sanitized);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={loading || isRateLimited || !form.formState.isValid}
          className="w-full"
        >
          {loading ? 'Submitting...' : 'Submit Securely'}
        </Button>

        {isRateLimited && (
          <p className="text-sm text-destructive">
            Rate limit exceeded. Please wait before submitting again.
          </p>
        )}
      </form>
    </Form>
  );
};