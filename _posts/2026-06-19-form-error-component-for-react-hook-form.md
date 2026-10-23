---
title: Form Error Component for react-hook-form
---

![](/assets/images/form-error-component-for-react-hook-form/01-9bdac717.png)

# Clean Server Error Handling in React Hook Form (Single + Multiple Errors from API)

This article shows you how to create a clean, reusable **FormError** component that handles server-side errors in React Hook Form — whether the server returns a single error message or an array of multiple errors.

## Why This Approach?

- Server errors should appear at the top in a prominent banner.
- Field validation errors stay inline below inputs.
- Supports both single error and multiple errors returned by the backend.
- Works great with React Query / TanStack Query.
- Simple to use and highly reusable.

## The FormError Component

Copy and paste this component into your project:


```
import { useState } from 'react';
import { FieldErrors, FieldValues } from 'react-hook-form';
import { AlertTriangle, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ServerError = string | string[] | null | undefined;

interface FormErrorProps<T extends FieldValues = FieldValues> {
  errors?: FieldErrors<T>;
  error?: ServerError;
  onDismiss?: () => void;
  className?: string;
}

export function FormError<T extends FieldValues>({
  errors,
  error,
  onDismiss,
  className,
}: FormErrorProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const getErrorMessages = (): string[] => {
    if (error) {
      if (Array.isArray(error)) return error.filter(Boolean);
      if (typeof error === 'string') return [error];
    }

    if (errors?.root) {
      const root = errors.root as any;

      if (Array.isArray(root)) {
        return root.map((e) => (typeof e === 'string' ? e : e?.message)).filter(Boolean);
      }
      if (root?.errors && Array.isArray(root.errors)) {
        return root.errors.filter(Boolean);
      }
      if (root?.message) return [root.message];
      if (typeof root === 'string') return [root];
    }
    return [];
  };

  const messages = getErrorMessages();
  if (messages.length === 0) return null;

  const isMultiple = messages.length > 1;
  const displayText = isMultiple
    ? `${messages.length} errors occurred`
    : messages[0];

  return (
    <div className={cn("mb-6 rounded-xl border border-red-200 bg-red-50 shadow-sm", className)} role="alert">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-red-100/60 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-red-700">{isMultiple ? 'Errors' : 'Error'}</p>
            <p className="text-sm text-red-600 line-clamp-1">{displayText}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDismiss && (
            <button onClick={(e) => { e.stopPropagation(); onDismiss(); }} className="rounded-full p-1 text-red-500 hover:bg-red-200">
              <X className="h-4 w-4" />
            </button>
          )}
          {isMultiple && (
            <ChevronDown className={cn("h-5 w-5 text-red-600 transition-transform", isOpen && "rotate-180")} />
          )}
        </div>
      </button>

      {(isOpen || !isMultiple) && messages.length > 0 && (
        <div className="border-t border-red-200 px-4 py-3">
          {messages.length === 1 ? (
            <p className="text-sm text-red-700 whitespace-pre-line">{messages[0]}</p>
          ) : (
            <ul className="space-y-1.5 text-sm text-red-700">
              {messages.map((msg, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                  <span className="whitespace-pre-line">{msg}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```


## Usage Examples

### 1. Basic Usage with React Hook Form


```
const { formState: { errors } } = useForm();

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <FormError errors={errors} />

    {/* Your form fields here */}
    <input {...register("email")} />
    ...
  </form>
);
```


### 2. Using with React Query / TanStack Query (Recommended)


```
const mutation = useMutation({
  mutationFn: createUser,
  onError: (err: any) => {
    // Server can return single string or array
    const apiError = err.response?.data?.errors || err.message;
    setServerError(apiError);
  }
});

const [serverError, setServerError] = useState<string | string[] | null>(null);

return (
  <>
    <FormError
      error={serverError}
      onDismiss={() => setServerError(null)}
    />

    <form onSubmit={handleSubmit(onSubmit)}>
      ...
    </form>
  </>
);
```


### 3. Setting Server Error Manually using setError


```
const { setError } = useForm();

const onSubmit = async (data) => {
  try {
    await apiCall(data);
  } catch (err: any) {
    setError("root", {
      type: "server",
      message: err.message,
      // You can also pass array:
      // errors: ["Email already exists", "Invalid password"]
    });
  }
};
```


### 4. Handling Multiple Errors from Server (Array)

Many backends return errors like this:


```
{
  "success": false,
  "errors": [
    "Email is already registered",
    "Password must contain at least one number",
    "Username is too short"
  ]
}
```


Then in your code:


```
onError: (err) => {
  const serverErrors = err.response?.data?.errors || [err.message];
  setServerError(serverErrors);   // Pass array directly
}
```


The `FormError` component will automatically show:

- **"3 errors occurred"** as the header
- Clickable to expand and see the full list

## Full Working Example


```
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { FormError } from './FormError';

export default function CreateUserForm() {
  const { register, handleSubmit, formState: { errors }, setError, reset } = useForm();
  const [serverError, setServerError] = useState(null);

  const mutation = useMutation({
    mutationFn: (data) => axios.post('/api/users', data),
    onSuccess: () => {
      reset();
      setServerError(null);
    },
    onError: (err: any) => {
      const apiErrors = err.response?.data?.errors || err.message;
      setServerError(apiErrors);
    }
  });

  const onSubmit = (data) => {
    setServerError(null);
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>

      <FormError
        errors={errors}
        error={serverError}
        onDismiss={() => setServerError(null)}
      />

      <input {...register("name", { required: true })} placeholder="Name" />
      <input {...register("email")} placeholder="Email" />

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
```


## Key Features

- Supports both **single error** and **array of errors**
- Works with `errors.root` from React Hook Form
- Collapsible when there are multiple errors
- Clean dismiss button
- Beautiful and accessible design
- Zero dependency on client-side validation logic

**Pro Tip:** Always clear the server error when the user starts typing again or resubmits the form for the best user experience.

## Conclusion

This `FormError` component gives you a professional and clean way to display server errors in your React Hook Form applications. It handles both single and multiple errors gracefully while keeping your code simple and maintainable.

Feel free to customize the styling according to your design system.
