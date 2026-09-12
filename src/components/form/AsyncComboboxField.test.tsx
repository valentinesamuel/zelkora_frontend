import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from 'vitest';

import { Form } from '@/components/ui/form';

import {
  AsyncComboboxField,
  type AsyncComboboxOption,
} from './AsyncComboboxField';

// Radix Popover relies on a few DOM APIs jsdom doesn't implement.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// `vitest.config.ts` runs with `test.globals` disabled, so React Testing
// Library's auto-cleanup never kicks in; unmount explicitly.
afterEach(() => {
  cleanup();
});

interface FormValues {
  staffId: string;
}

function Harness({
  searchFn,
}: Readonly<{
  searchFn: (
    query: string,
  ) => Promise<readonly AsyncComboboxOption[]>;
}>) {
  const form = useForm<FormValues>({ defaultValues: { staffId: '' } });
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Form {...form}>
        <form>
          <AsyncComboboxField
            control={form.control}
            name="staffId"
            label="Staff"
            searchFn={searchFn}
            placeholder="Search staff"
          />
        </form>
      </Form>
    </QueryClientProvider>
  );
}

describe('AsyncComboboxField', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces rapid typing into a single searchFn call', async () => {
    const user = userEvent.setup({
      advanceTimers: (ms) => vi.advanceTimersByTime(ms),
    });
    const searchFn: Mock = vi.fn().mockResolvedValue([
      { value: '1', label: 'Alice' },
    ]);

    render(<Harness searchFn={searchFn} />);

    await user.click(screen.getByRole('combobox'));
    const input = screen.getByPlaceholderText(/search staff/i);

    // Simulate 5 rapid keystrokes, all landing well within one debounce
    // window (the calls all happen synchronously, before any timer fires).
    for (const partial of ['a', 'al', 'ali', 'alic', 'alice']) {
      fireEvent.change(input, { target: { value: partial } });
    }

    // Nothing should have fired yet — under the 250ms default debounce.
    expect(searchFn).not.toHaveBeenCalledWith('alice');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });

    const aliceCalls = searchFn.mock.calls.filter(
      (call: unknown[]) => call[0] === 'alice',
    );
    expect(aliceCalls).toHaveLength(1);
  });

  it('moves the active option with ArrowDown/ArrowUp and commits with Enter', async () => {
    const user = userEvent.setup({
      advanceTimers: (ms) => vi.advanceTimersByTime(ms),
    });
    const searchFn: Mock = vi.fn().mockResolvedValue([
      { value: '1', label: 'Alice' },
      { value: '2', label: 'Bob' },
    ]);

    render(<Harness searchFn={searchFn} />);

    await user.click(screen.getByRole('combobox'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    await screen.findByText('Bob');

    const input = screen.getByPlaceholderText(/search staff/i);
    await user.type(input, '{ArrowDown}');
    await user.type(input, '{Enter}');

    expect(screen.getByRole('combobox')).toHaveTextContent('Bob');
  });

  it('renders an error row when searchFn rejects, without crashing', async () => {
    const user = userEvent.setup({
      advanceTimers: (ms) => vi.advanceTimersByTime(ms),
    });
    const searchFn: Mock = vi
      .fn()
      .mockRejectedValue(new Error('network down'));

    render(<Harness searchFn={searchFn} />);

    await user.click(screen.getByRole('combobox'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(
      await screen.findByText(/something went wrong/i),
    ).toBeInTheDocument();
  });
});
