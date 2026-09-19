import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_CURRENT_USER } from '../data/mockData.js';
const ROLE_STORAGE_KEY = 'bloodsphere_active_role';
const ACCOUNTS_STORAGE_KEY = 'bloodsphere_portal_accounts';
const PERSPECTIVE_STORAGE_KEY = 'bloodsphere_unified_perspective';
const USER_STORAGE_KEY = 'bloodsphere_current_user';
const SEED_PORTAL_ACCOUNTS = [
    {
        id: 'acc_admin_001',
        email: 'admin@bloodnet.gov.in',
        role: 'admin',
        name: 'National Super Admin',
        phone: '+91 800 256 6343',
        city: 'Hubballi',
        status: 'Verified'
    },
    {
        id: 'acc_hosp_001',
        email: 'admin@kims.edu.in',
        role: 'hospital',
        name: 'KIMS Teaching Hospital',
        phone: '+91 836 2378000',
        licenseNumber: 'LIC-HUB-4482',
        address: 'PB Road, Vidyanagar',
        city: 'Hubballi',
        state: 'Karnataka',
        contactPerson: 'Dr. Mahesh Kulkarni',
        status: 'Verified'
    },
    {
        id: 'acc_bb_001',
        email: 'contact@rotaryblood.org',
        role: 'bloodbank',
        name: 'Rotary Regional Blood Center',
        phone: '+91 836 2254321',
        licenseNumber: 'LIC-BB-9901',
        address: 'Deshpande Nagar',
        city: 'Hubballi',
        state: 'Karnataka',
        contactPerson: 'Sunil Patil',
        status: 'Verified'
    },
    {
        id: 'acc_donor_001',
        email: 'ananya.sharma@example.com',
        role: 'donor',
        name: 'Dr. Ananya Sharma',
        phone: '+91 98765 43210',
        city: 'Hubballi',
        status: 'Verified'
    },
    {
        id: 'acc_req_001',
        email: 'rohan.deshmukh@example.com',
        role: 'requester',
        name: 'Rohan Deshmukh',
        phone: '+91 97412 88901',
        city: 'Hubballi',
        status: 'Verified'
    }
];
const PUBLIC_LOGIN_PAGES = ['landing', 'login', 'login-donor-requester', 'login-hospital', 'login-bloodbank', 'login-admin', 'register'];
const ROLE_PERMISSIONS = {
    donor: [...PUBLIC_LOGIN_PAGES, 'dashboard', 'emergency-requests', 'rare-registry', 'group-circles', 'donor-search', 'leaderboard', 'profile'],
    requester: [...PUBLIC_LOGIN_PAGES, 'dashboard', 'emergency-requests', 'rare-registry', 'donor-search', 'blood-banks'],
    hospital: [...PUBLIC_LOGIN_PAGES, 'dashboard', 'emergency-requests', 'blood-bridge', 'blood-banks', 'camps'],
    bloodbank: [...PUBLIC_LOGIN_PAGES, 'dashboard', 'blood-banks', 'blood-bridge'],
    admin: [...PUBLIC_LOGIN_PAGES, 'dashboard', 'emergency-requests', 'rare-registry', 'group-circles', 'blood-bridge', 'donor-search', 'blood-banks', 'camps', 'leaderboard', 'profile']
};
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [currentRole, setCurrentRole] = useState(() => {
        const saved = localStorage.getItem(ROLE_STORAGE_KEY);
        return saved || 'donor';
    });
    const [unifiedPerspective, setUnifiedPerspectiveState] = useState(() => {
        const saved = localStorage.getItem(PERSPECTIVE_STORAGE_KEY);
        return saved || 'donor';
    });
    const [portalAccounts, setPortalAccounts] = useState(() => {
        const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            }
            catch (e) {
                return SEED_PORTAL_ACCOUNTS;
            }
        }
        return SEED_PORTAL_ACCOUNTS;
    });
    const [failedAttemptsMap, setFailedAttemptsMap] = useState({});
    const [pending2FAUser, setPending2FAUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            }
            catch (e) {
                // Fallback
            }
        }
        const savedRole = localStorage.getItem(ROLE_STORAGE_KEY) || 'donor';
        return {
            ...MOCK_CURRENT_USER,
            role: savedRole
        };
    });
    useEffect(() => {
        localStorage.setItem(ROLE_STORAGE_KEY, currentRole);
    }, [currentRole]);
    useEffect(() => {
        localStorage.setItem(PERSPECTIVE_STORAGE_KEY, unifiedPerspective);
    }, [unifiedPerspective]);
    useEffect(() => {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(portalAccounts));
    }, [portalAccounts]);
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        }
        else {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    }, [currentUser]);
    const setUnifiedPerspective = (view) => {
        setUnifiedPerspectiveState(view);
        localStorage.setItem(PERSPECTIVE_STORAGE_KEY, view);
        switchRole(view);
    };
    const switchRole = (role) => {
        setCurrentRole(role);
        localStorage.setItem(ROLE_STORAGE_KEY, role);
        if (currentUser) {
            const updatedUser = { ...currentUser, role };
            setCurrentUser(updatedUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        }
    };
    const login = (email, roleInput, licenseNumber) => {
        const matchedAccount = portalAccounts.find(a => a.email.toLowerCase().trim() === email.toLowerCase().trim());
        const actualRole = matchedAccount ? matchedAccount.role : (roleInput || 'donor');
        const accountKey = `${email}_${actualRole}`;
        const attempts = failedAttemptsMap[accountKey] || 0;
        if (attempts >= 5) {
            return { success: false, message: 'Account locked due to 5 failed login attempts. Contact Admin to unlock.' };
        }
        const account = matchedAccount || portalAccounts.find(a => a.role === actualRole);
        // Validate License Number if Hospital or Blood Bank
        if ((actualRole === 'hospital' || actualRole === 'bloodbank') && licenseNumber) {
            const matchLicense = portalAccounts.find(a => a.role === actualRole && a.licenseNumber?.toUpperCase().trim() === licenseNumber.toUpperCase().trim());
            if (!matchLicense) {
                setFailedAttemptsMap(prev => ({ ...prev, [accountKey]: (prev[accountKey] || 0) + 1 }));
                return { success: false, message: `${actualRole.toUpperCase()} License Registration Number not recognized. Access denied.` };
            }
        }
        if (account) {
            if (account.status === 'Pending Verification') {
                return { success: false, message: 'Your account is waiting for Admin verification.' };
            }
            if (account.status === 'Disabled') {
                return { success: false, message: 'Your account has been disabled. Please contact Blood Net support.' };
            }
        }
        // High security 2FA OTP for Hospital / Blood Bank
        if (actualRole === 'hospital' || actualRole === 'bloodbank') {
            const fallbackAcc = portalAccounts.find(a => a.role === actualRole) || (actualRole === 'bloodbank' ? SEED_PORTAL_ACCOUNTS[2] : SEED_PORTAL_ACCOUNTS[1]);
            setPending2FAUser({ email, role: actualRole, account: account || fallbackAcc });
            return { success: true, requires2FA: true, userRole: actualRole, message: 'Password accepted. 2FA OTP sent to registered authorization device.' };
        }
        // Reset failed attempts on success
        setFailedAttemptsMap(prev => ({ ...prev, [accountKey]: 0 }));
        switchRole(actualRole);
        const newUser = {
            ...MOCK_CURRENT_USER,
            email,
            role: actualRole,
            name: account?.name || MOCK_CURRENT_USER.name
        };
        setCurrentUser(newUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        return { success: true, userRole: actualRole, message: `Logged in successfully as ${actualRole.toUpperCase()}!` };
    };
    const verifyTwoFactorOtp = (otp) => {
        if (!pending2FAUser) {
            return { success: false, message: 'No 2FA verification session active.' };
        }
        if (otp.length === 6 && /^\d+$/.test(otp)) {
            const { email, role, account } = pending2FAUser;
            const accountKey = `${email}_${role}`;
            setFailedAttemptsMap(prev => ({ ...prev, [accountKey]: 0 }));
            switchRole(role);
            const newUser = {
                ...MOCK_CURRENT_USER,
                email,
                role,
                name: account.name
            };
            setCurrentUser(newUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
            setPending2FAUser(null);
            return { success: true, userRole: role, message: `2FA Verified! Welcome ${account.name}.` };
        }
        return { success: false, message: 'Invalid 2FA OTP code. Please enter 6-digit code sent to your phone.' };
    };
    const unlockAccountByAdmin = (accountId) => {
        const account = portalAccounts.find(a => a.id === accountId);
        if (account) {
            const accountKey = `${account.email}_${account.role}`;
            setFailedAttemptsMap(prev => ({ ...prev, [accountKey]: 0 }));
            updateAccountStatusByAdmin(accountId, 'Verified');
        }
    };
    const registerPortalAccount = (newAcc) => {
        const isSpecialRole = newAcc.role === 'hospital' || newAcc.role === 'bloodbank';
        const created = {
            id: `acc_${newAcc.role}_${Date.now()}`,
            email: newAcc.email || '',
            role: newAcc.role || 'donor',
            name: newAcc.name || 'New User',
            phone: newAcc.phone || '+91 98000 00000',
            licenseNumber: newAcc.licenseNumber,
            address: newAcc.address,
            city: newAcc.city || 'Hubballi',
            state: newAcc.state || 'Karnataka',
            contactPerson: newAcc.contactPerson,
            status: isSpecialRole ? 'Pending Verification' : 'Verified'
        };
        setPortalAccounts(prev => [created, ...prev]);
        // Send API persistence to backend MongoDB & emit socket event
        fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(created)
        }).catch(err => {
            console.warn('[AuthContext] Backend register sync fallback:', err.message);
        });
        return created;
    };
    const updateAccountStatusByAdmin = (accountId, status) => {
        setPortalAccounts(prev => prev.map(acc => (acc.id === accountId ? { ...acc, status } : acc)));
        // Send status update to Express API
        fetch(`http://localhost:5000/api/accounts/${accountId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        }).catch(err => {
            console.warn('[AuthContext] Backend status update fallback:', err.message);
        });
    };
    const deleteAccountByAdmin = (accountId) => {
        setPortalAccounts(prev => prev.filter(acc => acc.id !== accountId));
    };
    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(ROLE_STORAGE_KEY);
    };
    const isPageAllowedForRole = (page, role) => {
        const allowed = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.donor;
        return allowed.includes(page);
    };
    const authorizeRole = (requiredRole) => {
        if (!currentUser) {
            const loginPaths = {
                donor: '/login/donor',
                requester: '/login/requester',
                hospital: '/login/hospital',
                bloodbank: '/login/bloodbank',
                admin: '/login/admin'
            };
            return { isAuthorized: false, userRole: null, redirectPath: loginPaths[requiredRole] || '/login' };
        }
        if (currentRole !== requiredRole) {
            const defaultRolePath = {
                donor: '/donor/home',
                requester: '/requester/home',
                hospital: '/hospital/home',
                bloodbank: '/bloodbank/home',
                admin: '/admin/home'
            };
            return { isAuthorized: false, userRole: currentRole, redirectPath: defaultRolePath[currentRole] || '/login' };
        }
        return { isAuthorized: true, userRole: currentRole, redirectPath: '' };
    };
    return (<AuthContext.Provider value={{
            currentUser,
            currentRole,
            switchRole,
            login,
            verifyTwoFactorOtp,
            logout,
            isPageAllowedForRole,
            authorizeRole,
            unifiedPerspective,
            setUnifiedPerspective,
            portalAccounts,
            registerPortalAccount,
            updateAccountStatusByAdmin,
            deleteAccountByAdmin,
            failedAttemptsMap,
            unlockAccountByAdmin
        }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
