<template>
  <div class="login-page">
    <button v-if="!isAuthenticated && !showLoginForm" @click="showLoginForm = true">
      Login Page Placeholder Here
    </button>

    <div v-if="showLoginForm && !isAuthenticated" class="login-form-container">
      <h1 class="login-title">Login Here</h1>

      <v-form v-model="isFormValid" @submit.prevent="submitLogin">
        <v-alert v-if="errorMsg" type="error" :text="errorMsg" class="mb-4" />
        <v-alert v-if="successMsg" type="success" :text="successMsg" class="mb-4" />

        <!-- Form fields -->
        <div class="form-fields">
          <v-text-field
            v-model="email"
            label="Email"
            :rules="emailRules"
            required
            variant="underlined"
            bg-color="transparent"
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            :rules="passwordRules"
            required
            variant="underlined"
            bg-color="transparent"
          />

          <!-- Buttons section in horizontal layout, stacked on mobile -->
          <div class="button-row">
            <v-btn
              color="#333"
              type="submit"
              :loading="isLoading"
              :disabled="!isFormValid"
              class="login-btn"
            >
              LOGIN HERE
            </v-btn>

            <div class="secondary-buttons">
              <v-btn variant="text" @click="passwordResetDialog = true" class="secondary-btn">
                FORGOT PASSWORD
              </v-btn>

              <v-btn variant="text" @click="registerDialog = true" class="secondary-btn">
                REGISTER
              </v-btn>
            </div>
          </div>
        </div>
      </v-form>

      <!-- Registration Dialog - Made Responsive -->
      <v-dialog v-model="registerDialog" max-width="700px" fullscreen-breakpoint="sm">
        <v-card>
          <!-- Mobile friendly header -->
          <v-toolbar v-if="$vuetify.display.smAndDown" dark color="#333">
            <v-toolbar-title>Register New Account</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="registerDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-title v-else>Register New Account</v-card-title>

          <v-card-text>
            <v-form v-model="isRegisterFormValid">
              <div class="d-flex flex-column pa-4" style="width: 100%">
                <v-text-field
                  v-model="register.name"
                  label="Full Name"
                  :rules="nameRules"
                  required
                  class="mb-3"
                />

                <v-text-field
                  v-model="register.email"
                  label="Email"
                  type="email"
                  :rules="emailRules"
                  required
                  class="mb-3"
                />

                <v-text-field
                  v-model="register.password"
                  label="Password"
                  type="password"
                  :rules="passwordRules"
                  required
                  class="mb-3"
                />

                <v-text-field
                  v-model="register.c_password"
                  label="Confirm Password"
                  type="password"
                  :rules="confirmPasswordRules"
                  required
                  class="mb-3"
                />

                <v-btn
                  color="primary"
                  block
                  :loading="registerFormIsLoading"
                  :disabled="!isRegisterFormValid"
                  @click="submitRegister()"
                >
                  Register Account
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions v-if="!$vuetify.display.smAndDown">
            <v-spacer />
            <v-btn color="grey" text @click="registerDialog = false"> Cancel </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Forgot password dialog - Made Responsive -->
      <v-dialog v-model="passwordResetDialog" max-width="700px" fullscreen-breakpoint="sm">
        <v-card>
          <!-- Mobile friendly header -->
          <v-toolbar v-if="$vuetify.display.smAndDown" dark color="#333">
            <v-toolbar-title>Reset Password</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon @click="closePasswordResetDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-title v-else>Reset Password</v-card-title>

          <v-card-text>
            <v-form v-model="passwordResetFormIsValid">
              <div class="d-flex flex-column align-center justify-center pa-4" style="width: 100%">
                <v-alert
                  v-if="forgotPasswordSuccess"
                  type="success"
                  text="Password reset instructions have been sent to your email. Please check your inbox for the reset token."
                  class="mb-4"
                />

                <v-text-field
                  v-model="forgotEmail"
                  label="Email"
                  type="email"
                  :rules="emailRules"
                  class="mb-4 password-reset-form"
                  :disabled="forgotPasswordSuccess"
                />

                <div v-if="!forgotPasswordSuccess" class="w-100">
                  <v-btn
                    color="primary"
                    block
                    variant="text"
                    :loading="submitForgotPasswordLoading"
                    :disabled="!passwordResetFormIsValid"
                    @click="submitForgotPassword()"
                  >
                    Send Reset Instructions
                  </v-btn>
                </div>

                <div v-else class="w-100">
                  <v-btn color="primary" block @click="goToResetPassword" class="mt-3">
                    Go to Reset Password Page
                  </v-btn>
                </div>
              </div>
            </v-form>
          </v-card-text>
          <v-card-actions v-if="!$vuetify.display.smAndDown">
            <v-spacer />
            <v-btn color="grey" text @click="closePasswordResetDialog"> Close </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script src="./LoginView.ts"></script>
<style src="./LoginView.scss"></style>
