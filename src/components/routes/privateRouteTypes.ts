import { RouteComponentProps } from 'react-router-dom';
import { PrivateComponentProps } from '../../auth/auth';

export type PrivateRouteComponentProps = {
  [key: string]: any;
} & PrivateComponentProps &
  Partial<RouteComponentProps>;

export type PrivateRouteComponent = (props: PrivateRouteComponentProps) => JSX.Element;
