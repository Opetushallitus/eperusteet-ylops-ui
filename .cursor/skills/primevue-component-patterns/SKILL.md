---
name: primevue-component-patterns
description: PrimeVue 4 component usage patterns for Composition API, styled theming, forms, DataTable, accessibility, and TypeScript. Use when building Vue components with PrimeVue styled mode, implementing data tables with filtering/pagination, creating forms with validation, or ensuring accessibility compliance.
---

# PrimeVue 4 Component Patterns

Component usage patterns for PrimeVue with Composition API, styled themes, forms, and TypeScript.

## When to Apply

- Building Vue 3 apps with PrimeVue 4 styled components
- Implementing data tables with sorting, filtering, pagination
- Creating forms with validation and error handling
- Ensuring WCAG accessibility compliance

## Critical Rules

**Theme Setup**: Configure styled mode with preset during PrimeVue installation

```javascript
// WRONG - Missing theme configuration
import PrimeVue from 'primevue/config';
app.use(PrimeVue);

// RIGHT - Styled mode with Aura preset
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.dark-mode',
            cssLayer: false
        }
    }
});
```

**Form Validation**: Use `name` property instead of `v-model` with Form component

```vue
<!-- WRONG - Using v-model with Form -->
<Form>
    <InputText v-model="username" />
</Form>

<!-- RIGHT - Using name property -->
<Form v-slot="$form" :resolver :initialValues @submit="onFormSubmit">
    <InputText name="username" />
    <Message v-if="$form.username?.invalid">
        {{ $form.username.error?.message }}
    </Message>
</Form>
```

**DataTable Lazy Loading**: Set `lazy=true`, provide `totalRecords`, implement event handlers

```vue
<!-- WRONG - Missing required lazy loading props -->
<DataTable :value="data" paginator />

<!-- RIGHT - Complete lazy loading setup -->
<DataTable
    :value="customers"
    lazy
    paginator
    :totalRecords="totalRecords"
    :loading="loading"
    @page="onPage"
    @sort="onSort"
    @filter="onFilter"
/>
```

## Key Patterns

### Form with Validation

```vue
<template>
    <Form v-slot="$form" :resolver :initialValues @submit="onFormSubmit" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
            <InputText name="username" placeholder="Username" fluid />
            <Message v-if="$form.username?.invalid" severity="error" size="small" variant="simple">
                {{ $form.username.error?.message }}
            </Message>
        </div>
        <Button type="submit" label="Submit" />
    </Form>
</template>

<script setup>
import { ref } from 'vue';
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';

const initialValues = ref({ username: '' });
const resolver = ref(zodResolver(
    z.object({
        username: z.string().min(3, 'Username must be at least 3 characters')
    })
));

const onFormSubmit = ({ valid, values }) => {
    if (valid) console.log('Form data:', values);
};
</script>
```

### DataTable with Features

```vue
<template>
    <DataTable
        :value="products"
        v-model:selection="selectedProducts"
        v-model:filters="filters"
        :paginator="true"
        :rows="10"
        dataKey="id"
        filterDisplay="menu"
        :globalFilterFields="['name', 'category']"
        sortMode="multiple"
        stripedRows
    >
        <Column selectionMode="multiple" headerStyle="width: 3rem" />
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel }">
                <InputText v-model="filterModel.value" placeholder="Search by name" />
            </template>
        </Column>
        <Column field="category" header="Category" sortable>
            <template #body="{ data }">
                <Tag :value="data.category" />
            </template>
        </Column>
    </DataTable>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';

const products = ref([]);
const selectedProducts = ref([]);
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
});

onMounted(async () => {
    products.value = await fetchProducts();
});
</script>
```

### Lazy DataTable with Server-Side Operations

```vue
<template>
    <DataTable
        :value="customers"
        lazy
        paginator
        :first="first"
        :rows="10"
        :totalRecords="totalRecords"
        :loading="loading"
        @page="onPage"
        @sort="onSort"
        @filter="onFilter"
        v-model:filters="filters"
        filterDisplay="row"
    >
        <Column field="name" header="Name" sortable>
            <template #filter="{ filterModel, filterCallback }">
                <InputText 
                    v-model="filterModel.value" 
                    @keydown.enter="filterCallback()" 
                    placeholder="Search" 
                />
            </template>
        </Column>
    </DataTable>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const customers = ref([]);
const loading = ref(false);
const totalRecords = ref(0);
const first = ref(0);
const filters = ref({
    name: { value: '', matchMode: 'contains' }
});

const loadLazyData = async (event) => {
    loading.value = true;
    const data = await CustomerService.getCustomers({ 
        lazyEvent: JSON.stringify(event) 
    });
    customers.value = data.customers;
    totalRecords.value = data.totalRecords;
    loading.value = false;
};

const onPage = (event) => loadLazyData(event);
const onSort = (event) => loadLazyData(event);
const onFilter = (event) => loadLazyData(event);

onMounted(() => {
    loadLazyData({ first: 0, rows: 10 });
});
</script>
```

### Accessible Component with ARIA

```vue
<template>
    <Button 
        :aria-label="buttonLabel"
        :aria-describedby="descriptionId"
        :aria-expanded="isExpanded"
        @click="toggle"
    >
        {{ label }}
    </Button>
    <div :id="descriptionId" class="sr-only">
        {{ description }}
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps<{
    label: string;
    description: string;
    isExpanded?: boolean;
}>();

const descriptionId = computed(() => `desc-${Math.random().toString(36).substr(2, 9)}`);
const buttonLabel = computed(() => `${props.label} ${props.description}`);
</script>
```

## Common Mistakes

- **Missing theme preset** — Always configure a theme preset in main.js, components won't render properly without it
- **Using v-model with Form** — Use `name` property instead for proper validation integration
- **Incomplete lazy DataTable** — Must provide `totalRecords`, `loading`, and all event handlers for server-side operations
- **Missing ARIA attributes** — Add `aria-label`, `aria-describedby` for screen reader support
- **Wrong filter match modes** — Import `FilterMatchMode` from `@primevue/core/api`, not component files
- **Component registration** — Import components individually or use auto-import plugin to avoid bundle bloat