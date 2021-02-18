import React from 'react';
import { PrivateComponentProps } from '../../auth';

export type PrivateRouteComponentProps = {
    unauthorizedRedirect?: React.ReactNode;
} & PrivateComponentProps;

export type PrivateRouteComponent = (props: PrivateRouteComponentProps & { [key: string]: any }) => JSX.Element;
