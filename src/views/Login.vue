<!-- eslint-disable no-unused-vars -->
<script>
import { useLayout } from '@/layout/composables/layout';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import axios from 'axios';
import DashboardLogoDark from '../assets/dashboard-dark.png';
import DashboardLogoLight from '../assets/dashboard-light.png';

export default {
    setup() {
        const { toggleDarkMode, isDarkTheme } = useLayout();

        return {
            v$: useVuelidate(),
            API_URL: import.meta.env.VITE_BASE_URL,
            DashboardLogoDark: DashboardLogoDark,
            DashboardLogoLight: DashboardLogoLight,
            toggleDarkMode: toggleDarkMode,
            isDarkTheme: isDarkTheme
        };
    },
    data() {
        return {
            loading: false,
            failed_counter: 0,
            requires_captcha: false,
            formData: {
                user: '',
                password: ''
            }
        };
    },
    validations() {
        return {
            formData: {
                user: { required },
                password: { required }
            }
        };
    },
    mounted() {
        const currentDarkTheme = JSON.parse(localStorage.getItem('qris-merchant-dark'));
        currentDarkTheme ? document.documentElement.classList.add('app-dark') : document.documentElement.classList.remove('app-dark');
    },
    methods: {
        async login() {
            this.v$.$touch();
            if (this.v$.$invalid) {
                return;
            }

            this.loading = true;

            try {
                let result = await axios
                    .post(this.API_URL + '/login', {
                        username: this.formData.username,
                        password: this.formData.password
                    })
                    .then((result) => result.data);

                localStorage.setItem('qris-merchant-user-token', result.authorization.token);
                localStorage.setItem('qris-merchant-user-data', JSON.stringify(result.user));
            } catch (error) {
                this.failed_counter++;
                throw new Error(error.response?.data?.message || 'Login failed');
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>

<template>
    <FloatingConfigurator />
    <Toast position="top-left" />
    <div
        class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden"
        style="
            background: rgb(0, 0, 0);
            background: linear-gradient(
                149deg,
                rgba(0, 0, 0, 0.9473039215686274) 0%,
                rgba(84, 15, 5, 0.8660714285714286) 48%,
                rgba(137, 32, 18, 0.8576680672268908) 66%,
                rgba(166, 41, 25, 0.8548669467787114) 86%,
                rgba(201, 34, 13, 0.7204131652661064) 100%
            );
        "
    >
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-28 px-8 sm:px-20" style="border-radius: 53px">
                    <form @submit.prevent="login">
                        <div class="text-center mb-8">
                            <div class="flex items-center justify-center mb-20">
                                <!-- <img src="@/assets/icon.png" alt="" class="w-36" /> -->
                                <img v-if="isDarkTheme" src="@/assets/dashboard-light.png" alt="" class="w-[25%] absolute" />
                                <img v-else-if="!isDarkTheme" src="@/assets/dashboard-dark.png" alt="" class="w-[25%] absolute" />
                            </div>
                            <!-- <span class="text-muted-color font-medium">Sign in to continue</span> -->
                        </div>
                        <div>
                            <label for="user" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">User</label>
                            <InputText id="user" v-model="formData.user" v-bind="{ invalid: v$.formData.user.$error }" type="text" placeholder="Username" class="w-full md:w-[30rem] mb-8" />

                            <label for="password" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <Password id="password" v-model="formData.password" v-bind="{ invalid: v$.formData.password.$error }" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>

                            <Button type="submit" label="Sign In" class="w-full mt-5" :loading="loading"></Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
