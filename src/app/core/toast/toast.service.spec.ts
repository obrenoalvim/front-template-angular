import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => jest.useRealTimers());

  it('show() appends a toast with an incrementing id', () => {
    service.show('first', 'info');
    service.show('second', 'success');
    expect(service.toasts()).toEqual([
      { id: 0, message: 'first', variant: 'info' },
      { id: 1, message: 'second', variant: 'success' },
    ]);
  });

  it('auto-dismisses a toast after the given duration', () => {
    service.show('bye', 'info', 1000);
    expect(service.toasts()).toHaveLength(1);
    jest.advanceTimersByTime(1000);
    expect(service.toasts()).toHaveLength(0);
  });

  it('dismiss() removes a toast by id immediately', () => {
    service.show('a');
    service.dismiss(0);
    expect(service.toasts()).toHaveLength(0);
  });

  it('success()/error() use the matching variant', () => {
    service.success('ok');
    service.error('bad');
    expect(service.toasts().map((t) => t.variant)).toEqual(['success', 'error']);
  });
});
