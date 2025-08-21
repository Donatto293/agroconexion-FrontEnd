import api from "../utils/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL= '/api/users/'

const URL= api.defaults.baseURL

//para actualizar el user
export const userInfo = async (token) => {
    try {
        const response = await api.get(`${API_URL}my-info/`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('API call error en userInfo:', error);
        throw error;
    }
  
};

//refrest Token 

export const refreshTokenAPI = async (refreshTokenValue) => {
  try {
    const response = await axios.post(`${URL}/api/token/refresh/`, {
      refresh: refreshTokenValue
     
    });
    return response;
  } catch (error) {
    console.error('API call error en refreshTokenAPI :', error);
    throw error;
  }
};


export const userUpdate= async (form)=>{

    try {
        const token = await AsyncStorage.getItem('accessToken');
        const response = await fetch(`${URL}${API_URL}update/`, {
                method: 'PUT',
                
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    Accept: 'application/json' 
                },
                body: form
                });
        // Si devuelve error, intenta parsear cuerpo y lanzar mensaje útil
        if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        const msg = errJson?.detail || `Error en actualización (${response.status})`;
        const e = new Error(msg);
        e._server = errJson;
        throw e;
        }

        // **devuelve el JSON** ya parseado
        return await response.json();
    } catch (error) {
        console.error('API call error en UserUpdate:', error);
        throw error;
        
    }
}

//registar un user
export const userRegister = async (url, data) => {
  try {
    const response = await fetch(`${URL}${url}`, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: data
                });

    return response;
  } catch (error) {
    console.error('API call error en Register:', error);
    throw error;
  }
};


//iniciar sesion User
export const userLogin = async(username, password)=> {
   try {
     const response = await api.post(`${API_URL}login/`, {
            username,
            password,
    })
    return response;

    
   } catch (error) {
    console.error('API call error en el login:', error);
    throw error;
    
   }
   
}

//autentificacion 2 pasos
export const loginStep2 = async (email, code) => {
  try {
    const response = await api.post(`${API_URL}login/step2/`, { email, code });
    return response;
  } catch (error) {
    console.error('API call error en el login2:', error);
    throw error.response?.data || error.message;
  }
};



//verificar User
export const userVerifity = async(email, code)=>{
    try {
        const response = await api.post(`${API_URL}verify-account/`, {
            email,
            code
        });
        return response
        }catch (error) {
        // Log detallado del error
        console.error('Error al verificar la cuenta:', {
            
            error: error.response?.data || error.message
        });
      
        // Lanza error con mensaje amigable
        throw new Error(error.response?.data?.detail || 'Error en la verificacion del producto');
    }
}

// 1) Solicitud de recuperación de contraseña
export const requestPasswordReset = async (email) => {
    try {
        const response = await api.post(`${API_URL}password-reset/request/`, { email });
        return response.data;
    } catch (error) {
        console.error('API error en requestPasswordReset:', error.response?.data || error.message);
        throw error;
    }
};

// 2) Confirmación de nueva contraseña
export const confirmPasswordReset = async (email, code, newPassword, confirmNewPassword) => {
    try {
        const response = await api.post(`${API_URL}password-reset/confirm/`, {
            email,
            code,
            new_password: newPassword,
            new_password2: confirmNewPassword
        });
        return response.data;
    } catch (error) {
        console.error('API error en confirmPasswordReset:', error.response?.data || error.message);
        throw error;
    }
};

// 1) cambio de contraseña

export const requestPasswordChange = async ()=> {
    try {
    const token = await AsyncStorage.getItem('accessToken');
    
    // Verifica si el token existe
    if (!token) {
      throw new Error('No se encontró token de acceso');
    }

    const response = await api.post(
      `${API_URL}change-password/request/`,
      null,  // Body vacío
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    
    return { status: 'success', message: response.data.message };
  } catch (error) {
    return { 
      status: 'error', 
      message: error.response?.data?.error || error.message 
    };
  }
}
// 2) confirmacion de contraseña
export const confirmPasswordChange = async(code, newPassword)=>{
    try {
          const token = await AsyncStorage.getItem('accessToken');
        const response = await api.post(
            `${API_URL}change-password/confirm/`,
            {
                code,
                new_password: newPassword,
                new_password2: newPassword
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );
        return { status: 'success', message: response.data.message };
    } catch (error) {
        return { 
            status: 'error', 
            message: error.response?.data?.error || error.message 
        };
    }

}


export const userToggle2fa = async (enable)=>{
  try {
    const token = await AsyncStorage.getItem('accessToken')
    const response = await api.post(`${API_URL}toggle-2fa/`,{
      enable
    },{headers: {
                    Authorization: `Bearer ${token}`,
                } }
  )
  return response
  } catch (error) {
    console.error('API error en toggle2fa:', error.response?.data || error.message);
      throw error;
  }
}