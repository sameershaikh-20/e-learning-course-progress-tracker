import { AlertCircle, RotateCw } from 'lucide-react';

export function ErrorState({ message = 'Something went wrong while loading this page.', onRetry }) {
  return <section className="error-state" role="alert"><AlertCircle size={24}/><p>{message}</p><button type="button" className="button button-primary" onClick={onRetry}><RotateCw size={15}/> Retry</button></section>;
}
