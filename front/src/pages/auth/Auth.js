import React, { createContext, useContext, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { AllUser, GeneralSettings} from '../../environment/GlobalApi';
import { PrivateAxios } from '../../environment/AxiosInstance';


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(sessionStorage.getItem("token") || '');
    const [userDetails, setUserDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [User, setUser] = useState([]);
    const [vendor, setVendor] = useState([]);
    const [getCustomer, setCustomer] = useState([]);
    const [getUomData , setUomData] = useState([]);
    const [productData, setProduct] = useState([]);
    const [getGeneralSettingssymbol, setGeneralSettings] = useState(false);
    const [getGeneralSettingsDAddress, setGeneralSettingsDAddress] = useState(false);
    const [getGeneralSettingsCAddress, setGeneralSettingsCAddress] = useState(false);
    const [getGeneralSettingsSignature, setGeneralSettingsSignature] = useState(false);
    const [category, setCategory] = useState([]);
    const [mode, setMode] = useState([]);
    const [status, setStatus] = useState([]);
    const [holidayList, setHolidayList] = useState([]);
    const [officeTimeList, setOfficeTimeList] = useState([]);
  const [userPermissions, setUserPermission] = useState([]);
    //Login Store in localstorage
    const StoreToken = (token) => {
        sessionStorage.setItem("token", token);
        setToken(token); // Assuming setToken updates the state with the token
        //localStorage.setItem("token", token);
        //setToken(token)
        return <Navigate to="/v1/welcome" />;
    };
const MatchPermission = (permission) => {
       
        if (userPermissions.length > 0) {
            const hasPermission = permission.some(permission =>
                userPermissions.includes(permission)
            );
            return hasPermission;
        } else {
            return false;
        }
    }
    //Logout from Dashboard
    const Logout = () => {
        setToken(""); // Clear token state
        sessionStorage.removeItem("token"); // Remove token from sessionStorage
        return <Navigate to="/" />;
    }
const getPermission = () => {
        PrivateAxios.get('/user/get-permission')
            .then((res) => {
                setUserPermission(res.data.permission);
               
            }).catch((err) => {
 
            })
    }
    //Call all necessary function
    const AllUsers = async () => {
        const newUserArray = await AllUser();
        if (newUserArray == 401) {
            Logout();
        }
        setUser(newUserArray.user);
    }
    const OfficeTiming = async () => {
        PrivateAxios.get("office-time")
            .then((res) => {
                setOfficeTimeList(JSON.parse(res.data.data.working_days));
            }).catch((err) => {
                if (err.response.status == 401) {
                    Logout();
                }
            })
    }
    const vendordata = async () => {
        PrivateAxios.get("vendor/all-Vendors")
            .then((res) => {
                setVendor(res.data.data);
            }).catch((err) => {
                if (err.response.status == 401) {
                    Logout();
                }
            })
    }
   

    const customer = async () => {
        PrivateAxios.get("customer/all-customers")
            .then((res) => {
                setCustomer(res.data.data);
            }).catch((err) => {
                if (err.response.status == 401) {
                    Logout();
                }
            })
    }
    const productdata = async () => {
        PrivateAxios.get("product/all-products")
            .then((res) => {
                setProduct(res.data.data);
            }).catch((err) => {
                if (err.response.status == 401) {
                    Logout();
                }
            })
    }
    
    useEffect(() => {
        const fetchGeneralSettings = async () => {
        try {
            const result = await GeneralSettings();
            setGeneralSettings(result.data.currency && result.data.currency.symbol);
            setGeneralSettingsDAddress(result.data && result.data.deliveryAddress);
            setGeneralSettingsCAddress(result.data && result.data.companyAddress);
            setGeneralSettingsSignature(result.data && result.data.signature);

        } catch (error) {
            console.error("Error fetching general settings:", error);
            // Optionally, set an error state or show an error message
        }
        };
        const AllCategories= async () => {
            try {
                const response = await PrivateAxios.get("category/all-products-cat")
                setCategory(response.data.data);
        
            } catch (error) {
                if (error.response.status == 401) {
                    Logout();
                }
            }
        }
       
        const uomdata = () => {
            PrivateAxios.get('getuom')
                .then((res) => {
                    const responseData = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
                    setUomData(responseData);
                })
                .catch((err) => {
                    console.error(err);
                });
        };
        if (token) {
            getPermission();
            setUserDetails(jwtDecode(token));
            AllUsers();
            OfficeTiming();
            vendordata();
            productdata();
            customer();
            fetchGeneralSettings();
            AllCategories();
            uomdata();
        }
    }, [token])


    let isLoggedIn = !!token; //return true false

    return <AuthContext.Provider value={{ StoreToken, MatchPermission, token,getCustomer, userDetails,getGeneralSettingssymbol,getGeneralSettingsDAddress,getGeneralSettingsCAddress,getGeneralSettingsSignature, isLoading, setIsLoading, productData, holidayList, officeTimeList, Logout, isLoggedIn,  User, mode, status,vendor,category, getUomData }}>
        {children}
    </AuthContext.Provider>
}
//console.log(sessionStorage.getItem("token"));
export const UserAuth = () => {
    const authCOntextValue = useContext(AuthContext);
    if (!authCOntextValue) {
        throw new Error("useAuth used outside of the provider")
    }
    return authCOntextValue;
}