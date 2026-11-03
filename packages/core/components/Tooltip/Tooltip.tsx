import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, Ref } from 'react';
import cn from 'classnames';

import { tip, wrapper } from './Tooltip.css';

function formatDate(date: Date): string {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${day.toString().padStart(2, '0')} ${monthNames[monthIndex]} ${year}`;
}

export type TooltipProps = {
  text?: string;
  delay?: number;
} & HTMLAttributes<HTMLDivElement>;

const TooltipRenderer = (
  {
    children,
    text = formatDate(new Date()),
    delay = 1000,
    ...rest
  }: TooltipProps,
  ref: Ref<HTMLDivElement>,
) => {
  const [show, setShow] = useState(false);
  const tooltipId = useId();
  const timer = useRef<number | undefined>();
  const hovered = useRef(false);
  const focused = useRef(false);
  const dismissed = useRef(false);

  const cancelTimer = () => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
  };

  useEffect(() => cancelTimer, []);

  const scheduleShow = () => {
    if (dismissed.current || show) return;
    cancelTimer();
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      setShow(true);
    }, delay);
  };

  const hideIfInactive = () => {
    if (hovered.current || focused.current) return;
    cancelTimer();
    dismissed.current = false;
    setShow(false);
  };

  return (
    <div
      {...rest}
      className={cn(wrapper, rest.className)}
      tabIndex={rest.tabIndex ?? 0}
      aria-describedby={
        show
          ? [rest['aria-describedby'], tooltipId].filter(Boolean).join(' ')
          : rest['aria-describedby']
      }
      onMouseEnter={event => {
        rest.onMouseEnter?.(event);
        hovered.current = true;
        scheduleShow();
      }}
      onMouseLeave={event => {
        rest.onMouseLeave?.(event);
        hovered.current = false;
        hideIfInactive();
      }}
      onFocus={event => {
        rest.onFocus?.(event);
        focused.current = true;
        scheduleShow();
      }}
      onBlur={event => {
        rest.onBlur?.(event);
        if (event.currentTarget.contains(event.relatedTarget)) return;
        focused.current = false;
        hideIfInactive();
      }}
      onKeyDown={event => {
        rest.onKeyDown?.(event);
        if (event.key === 'Escape') {
          cancelTimer();
          dismissed.current = true;
          setShow(false);
        }
      }}
      ref={ref}
    >
      {show && (
        <div id={tooltipId} role="tooltip" className={tip}>
          {text}
        </div>
      )}
      {children}
    </div>
  );
};

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(TooltipRenderer);

