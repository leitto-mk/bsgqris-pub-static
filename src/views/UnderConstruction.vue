<script>
export default {
    beforeRouteEnter(to, from, next) {
        // The 'from' object contains the previous route details
        next((vm) => {
            vm.previousPath = from.fullPath;

            vm.startCountdown();

            // Redirect back to previous path after 3 seconds
            setTimeout(() => {
                vm.$router.push(vm.previousPath);
            }, 3000);
        });
    },
    data() {
        return {
            countdown: 3, // Initialize countdown (in seconds)
            previousPath: '' // To store the previous path
        };
    },
    methods: {
        startCountdown() {
            const interval = setInterval(() => {
                if (this.countdown > 0) {
                    this.countdown--;
                } else {
                    clearInterval(interval); // Stop the interval when countdown reaches 0
                    this.$router.push(this.previousPath); // Redirect to previous path
                }
            }, 1000); // Update every second
        }
    }
};
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900">
        <div class="flex flex-col gap-12">
            <!-- Pulsing Effect -->
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="h-72 w-72 rounded-full bg-amber-500 opacity-75 animate-ping"></div>
            </div>

            <!-- Custom Logo -->
            <div class="relative z-10 left-8">
                <img src="/src/assets/icon.png" alt="Logo" class="h-48 w-48" />
            </div>

            <span class="text-2xl uppercase z-50">Under Construction</span>
            <span class="text-xl uppercase z-50 text-center">Redirect in {{ countdown }} seconds...</span>
        </div>
    </div>
</template>
