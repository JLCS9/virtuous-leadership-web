import { Navigate } from 'react-router-dom';
import { useLocalPath } from '../i18n';

export default function MiPanel() {
  const lp = useLocalPath();
  return <Navigate to={lp('/app')} replace />;
}
