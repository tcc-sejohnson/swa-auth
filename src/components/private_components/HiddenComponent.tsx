import React from 'react';
import { Roles } from '../../auth/auth';
import ProtectedComponent from './ProtectedComponent';

export interface HiddenComponentProps {
  allowedRoles: Roles;
  allBut?: boolean;
  authenticatingComponent?: JSX.Element;
  children: React.ReactNode;
}

/**
 * Renders its children if the user is in one of the allowed roles,
 * else does not render. Useful for contextually rendering objects for different
 * classes of user.
 */
const HiddenComponent = ({
  allowedRoles,
  allBut,
  authenticatingComponent,
  children,
}: HiddenComponentProps): JSX.Element => {
  return (
    <ProtectedComponent
      allowedRoles={allowedRoles}
      allBut={allBut}
      authenticatingComponent={authenticatingComponent}
      unauthorizedComponent={<></>}
    >
      {children}
    </ProtectedComponent>
  );
};

export default HiddenComponent;
