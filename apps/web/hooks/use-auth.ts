'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookie from 'js-cookie';
import { useCallback, useEffect, useSyncExternalStore } from 'react';
import type { AccessTokenOutput, SigninInput, SigninOutput, SignupInput, TwoFactorVerifyInput, UserOutput } from '@repo/contracts';
import { TOKEN_COOKIE } from '@/lib/axios';
import { queryKeys } from '@/lib/query-keys';
import { authService } from '@/lib/services';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, setCredentials } from '@/store/slices/auth.slice';

/**
 * `document.cookie` faqat brauzerda mavjud, shuning uchun uni to'g'ridan-to'g'ri
 * render paytida o'qish server va klientning birinchi (hydration) render'ida har
 * xil natija berib, hydration mismatch keltirib chiqaradi. `useSyncExternalStore`
 * ikkalasida ham `false` bilan boshlanishini kafolatlaydi — `useEffect` +
 * `setState` idiomasidan farqli, bu qo'shimcha render tsiklisiz ishlaydi.
 */
const noopSubscribe = () => () => {};
const useHasMounted = (): boolean => useSyncExternalStore(noopSubscribe, () => true, () => false);

const storeToken = (token: AccessTokenOutput): void => {
  Cookie.set(TOKEN_COOKIE, token.accessToken, {
    expires: token.expiresIn / 86_400,
    sameSite: 'lax',
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  });
};

export const useSession = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const mounted = useHasMounted();
  const hasToken = mounted && Boolean(Cookie.get(TOKEN_COOKIE));

  const query = useQuery({
    queryKey: queryKeys.me,
    queryFn: () => authService.me(),
    enabled: hasToken && !user,
    retry: false,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    const fetched = query.data;
    if (fetched && !user) {
      dispatch(setCredentials({ user: fetched, token: Cookie.get(TOKEN_COOKIE) ?? '' }));
    }
  }, [query.data, user, dispatch]);

  return {
    user,
    loading: hasToken && !user && query.isPending,
    isAuthenticated: Boolean(user),
  };
};

/** Token qabul qilinganda bajariladigan umumiy yakunlash — parol bilan ham, 2FA tasdiqlangandan keyin ham ishlatiladi. */
const useCompleteSignin = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useCallback(
    async (token: AccessTokenOutput) => {
      storeToken(token);
      const user: UserOutput = await authService.me();
      dispatch(setCredentials({ user, token: token.accessToken }));
      queryClient.setQueryData(queryKeys.me, user);
    },
    [dispatch, queryClient],
  );
};

/**
 * `SigninOutput` ikki holatdan birini qaytaradi: to'g'ridan-to'g'ri token (`mfaRequired: false`)
 * yoki 2FA challenge (`mfaRequired: true`) — chaqiruvchi komponent shu bayroqqa qarab
 * kod so'rash ekranini ko'rsatadi. Faqat birinchi holatda sessiya yakunlanadi.
 */
export const useSignIn = () => {
  const completeSignin = useCompleteSignin();

  return useMutation({
    mutationFn: (input: SigninInput) => authService.signIn(input),
    onSuccess: async (result: SigninOutput) => {
      if (!result.mfaRequired) await completeSignin(result);
    },
  });
};

export const useVerifyTwoFactor = () => {
  const completeSignin = useCompleteSignin();

  return useMutation({
    mutationFn: (input: TwoFactorVerifyInput) => authService.verifyTwoFactor(input),
    onSuccess: async (result: SigninOutput) => {
      if (!result.mfaRequired) await completeSignin(result);
    },
  });
};

export const useSignUp = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SignupInput) => {
      const token = await authService.signUp(input);
      storeToken(token);

      const user: UserOutput = await authService.me();
      return { token, user };
    },
    onSuccess: ({ token, user }) => {
      dispatch(setCredentials({ user, token: token.accessToken }));
      queryClient.setQueryData(queryKeys.me, user);
    },
  });
};

export const useSignOut = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useCallback(() => {
    authService.signOut().catch(() => undefined);
    Cookie.remove(TOKEN_COOKIE);
    dispatch(logout());
    queryClient.clear();
  }, [dispatch, queryClient]);
};
