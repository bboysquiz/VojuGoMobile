import {
  type SelfResponse,
  getSelf,
} from '../../auth/api/auth.api';

import {
  apiRequest,
} from '../../../shared/api/http';

export interface UpdateProfileRequest {
  name: string;
  city: string;
  company_name: string;
}

export { getSelf };

export function updateProfile(
  payload: UpdateProfileRequest
) {
  return apiRequest<SelfResponse>(
    '/self',
    {
      method: 'PATCH',
      body: payload,
    }
  );
}