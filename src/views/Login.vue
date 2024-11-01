<!-- eslint-disable no-unused-vars -->
<script>
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import axios from 'axios';

export default {
    setup() {
        return {
            v$: useVuelidate(),
            API_URL: import.meta.env.VITE_BASE_URL
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
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
        <div class="flex flex-col items-center justify-center">
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                    <form @submit.prevent="login">
                        <div class="text-center mb-8">
                            <div class="flex items-center justify-center mb-10">
                                <img src="@/assets/icon.png" alt="" class="w-36" />
                            </div>
                            <div class="text-surface-900 dark:text-surface-300 text-3xl font-medium">QRIS Merchant Management</div>
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
