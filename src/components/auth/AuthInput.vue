<template>
  <label class="auth-field">
    <span class="auth-label">
      {{ label }}
    </span>

    <span class="auth-input-wrapper">
      <component :is="type === 'password' ? LockKeyhole : UserRound" class="auth-icon" :size="20" :stroke-width="1.8" />

      <input
        ref="input"
        :aria-invalid="invalid || undefined"
        :autocomplete="autocomplete"
        class="auth-input"
        :class="{ 'auth-input--invalid': invalid }"
        :disabled="disabled"
        :placeholder="placeholder"
        :required="required"
        :type="inputType"
        :value="model"
        @input="onInput"
      >

      <button
        v-if="type === 'password'"
        :aria-label="visible ? 'Ocultar senha' : 'Mostrar senha'"
        :aria-pressed="visible"
        class="password-toggle"
        type="button"
        @click="visible = !visible"
      >
        <Transition mode="out-in" name="icon-swap">
          <EyeOff v-if="visible" key="hide" :size="20" />
          <Eye v-else key="show" :size="20" />
        </Transition>
      </button>
    </span>
  </label>
</template>

<script setup lang="ts">
  import {
    Eye,
    EyeOff,
    LockKeyhole,
    UserRound,
  } from '@lucide/vue'
  import { computed, ref, watch } from 'vue'

  const props = withDefaults(defineProps<{
    label: string
    type?: 'text' | 'password'
    placeholder?: string
    autocomplete?: string
    required?: boolean
    disabled?: boolean
    invalid?: boolean
  }>(), {
    type: 'text',
    placeholder: '',
    autocomplete: 'off',
    required: false,
    disabled: false,
    invalid: false,
  })

  const model = defineModel<string>({ required: true })

  const emit = defineEmits<{ visibilidade: [visivel: boolean] }>()

  const visible = ref(false)
  watch(visible, valor => emit('visibilidade', valor))
  const input = ref<HTMLInputElement | null>(null)

  // Permite à página devolver o foco ao campo (ex.: depois de errar a senha).
  defineExpose({ focus: () => input.value?.focus() })

  const inputType = computed(() => {
    if (props.type === 'password' && !visible.value) {
      return 'password'
    }

    return 'text'
  })

  function onInput (event: Event): void {
    model.value = (event.target as HTMLInputElement).value
  }
</script>

<style scoped>
.auth-field {
  display: block;
  width: 100%;
}

.auth-label {
  display: block;
  margin-bottom: 8px;
  color: #194d42;
  font-size: 15px;
  font-weight: 600;
}

.auth-input-wrapper {
  position: relative;
  display: block;
}

.auth-input {
  display: block;
  width: 100%;
  height: 56px;
  padding: 0 50px;
  border: 1px solid #b8d0c5;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.45);
  color: #263d35;
  font-size: 16px;
  outline: none;
  box-shadow: none;
  transition:
    border-color 220ms ease,
    box-shadow 220ms ease,
    background-color 220ms ease;
}

.auth-input::placeholder {
  color: #98a6a0;
}

.auth-input:hover:not(:disabled) {
  border-color: #85ab9b;
}

.auth-input:focus {
  border-color: #356b5b;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 0 3px rgba(53, 107, 91, 0.09);
}

.auth-input--invalid,
.auth-input--invalid:hover:not(:disabled) {
  border-color: #b3261e;
  background: rgba(179, 38, 30, 0.04);
}

.auth-input--invalid:focus {
  border-color: #b3261e;
  box-shadow: 0 0 0 3px rgba(179, 38, 30, 0.12);
}

.auth-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-icon {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  color: #7c9a8e;
  pointer-events: none;
  transition: color 200ms ease;
}

.auth-field:focus-within .auth-icon {
  color: #356b5b;
}

.auth-field:has(.auth-input--invalid) .auth-icon {
  color: #b3261e;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  padding: 4px;
  border: none;
  background: transparent;
  color: #7c9a8e;
  cursor: pointer;
  transition: color 200ms ease;
}

.password-toggle:hover {
  color: #356b5b;
}

.password-toggle:active {
  transform: translateY(-50%) scale(0.9);
}

.password-toggle:focus-visible {
  outline: 2px solid #356b5b;
  outline-offset: 3px;
  border-radius: 4px;
}

.icon-swap-enter-active,
.icon-swap-leave-active {
  transition:
    opacity 130ms ease,
    transform 130ms ease;
}

.icon-swap-enter-from {
  opacity: 0;
  transform: scale(0.75);
}

.icon-swap-leave-to {
  opacity: 0;
  transform: scale(1.15);
}

@media (prefers-reduced-motion: reduce) {

  .auth-input,
  .auth-icon,
  .password-toggle,
  .icon-swap-enter-active,
  .icon-swap-leave-active {
    transition: none;
  }
}
</style>
