import { createContext, useContext, useRef, useState } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';

const ToastContext = createContext(() => {});
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const timers = useRef(new Map());

  const dismiss = id => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setItems(all => all.filter(item => item.id !== id));
  };

  const toast = (message, type = 'success', options = {}) => {
    const id = Date.now() + Math.random();
    const item = { id, message, type, actionLabel: options.actionLabel, onAction: options.onAction };
    setItems(all => [...all, item]);
    timers.current.set(id, setTimeout(() => dismiss(id), options.duration ?? (options.actionLabel ? 3000 : 3600)));
    return id;
  };

  return <ToastContext.Provider value={toast}>{children}<div className="toast-stack" aria-live="polite">{items.map(item => <div className={`toast ${item.type}`} key={item.id}>{item.type === 'error' ? <XCircle size={18}/> : <CheckCircle2 size={18}/>}<span>{item.message}</span>{item.actionLabel && <button className="toast-action" onClick={() => { item.onAction?.(); dismiss(item.id); }}>{item.actionLabel}</button>}<button aria-label="Dismiss" onClick={() => dismiss(item.id)}><X size={15}/></button></div>)}</div></ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
