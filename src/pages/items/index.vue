<template>
  <div>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h5">Itens</h1>
      <v-spacer />
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openForm()">Novo item</v-btn>
    </div>

    <v-text-field
      v-model="search"
      clearable
      hide-details
      label="Buscar"
      prepend-inner-icon="mdi-magnify"
      @update:model-value="load"
    />

    <v-list class="mt-4" lines="two">
      <v-list-item v-if="!loading && items.length === 0" title="Nenhum item ainda." />

      <v-list-item
        v-for="item in items"
        :key="item.id"
        :subtitle="item.description"
        :title="item.title"
      >
        <template #prepend>
          <v-checkbox-btn :model-value="item.done" @update:model-value="toggle(item)" />
        </template>

        <template #append>
          <v-btn icon="mdi-pencil" variant="text" @click="openForm(item)" />
          <v-btn color="error" icon="mdi-delete" variant="text" @click="remove(item)" />
        </template>
      </v-list-item>
    </v-list>

    <v-dialog v-model="dialog" max-width="480">
      <v-card :title="editing ? 'Editar item' : 'Novo item'">
        <v-card-text>
          <v-text-field v-model="form.title" label="Título" />
          <v-textarea v-model="form.description" label="Descrição" />
          <v-checkbox v-model="form.done" label="Concluído" />
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" @click="save">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
  import type { Item } from '@/interfaces/item'
  import { onMounted, reactive, ref } from 'vue'
  import itemsService from '@/services/items'
  import { notify } from '@/utils/notify'

  const items = ref<Item[]>([])
  const search = ref('')
  const loading = ref(false)
  const saving = ref(false)
  const dialog = ref(false)
  const editing = ref<Item | null>(null)
  const form = reactive({ title: '', description: '', done: false })

  async function load () {
    loading.value = true
    try {
      const data = await itemsService.list({ search: search.value || undefined })
      items.value = data.results
    } catch (error) {
      notify.error((error as Error).message)
    } finally {
      loading.value = false
    }
  }

  function openForm (item?: Item) {
    editing.value = item ?? null
    Object.assign(form, item
      ? { title: item.title, description: item.description, done: item.done }
      : { title: '', description: '', done: false })
    dialog.value = true
  }

  async function save () {
    saving.value = true
    try {
      await (editing.value
        ? itemsService.update(editing.value.id, { ...form })
        : itemsService.create({ ...form }))
      dialog.value = false
      notify.success('Item salvo.')
      await load()
    } catch (error) {
      notify.error((error as Error).message)
    } finally {
      saving.value = false
    }
  }

  async function toggle (item: Item) {
    try {
      await itemsService.update(item.id, { done: !item.done })
      await load()
    } catch (error) {
      notify.error((error as Error).message)
    }
  }

  async function remove (item: Item) {
    try {
      await itemsService.remove(item.id)
      notify.success('Item excluído.')
      await load()
    } catch (error) {
      notify.error((error as Error).message)
    }
  }

  onMounted(load)
</script>
