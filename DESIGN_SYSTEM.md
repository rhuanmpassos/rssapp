# 🎨 Design System - RSS Aggregator App

## Visão Geral

Este documento descreve o design system completo implementado no RSS Aggregator App, baseado em **Material Design 3**, **Apple Human Interface Guidelines** e melhores práticas de design moderno.

---

## 📐 Princípios de Design

### 1. Hierarquia Visual
- **Clareza**: Elementos importantes são destacados através de tamanho, cor e elevação
- **Contraste**: Diferenças sutis mas perceptíveis entre elementos
- **Espaçamento**: Sistema de espaçamento consistente baseado em múltiplos de 4px

### 2. Consistência
- **Padrões unificados**: Todos os componentes seguem os mesmos princípios
- **Estados consistentes**: Hover, pressed, disabled, loading em todos os elementos interativos
- **Animações suaves**: Transições de 150-350ms para feedback visual

### 3. Acessibilidade
- **Contraste mínimo**: WCAG AA (4.5:1 para texto normal, 3:1 para texto grande)
- **Área de toque**: Mínimo de 44x44px (Apple HIG)
- **Feedback háptico**: Resposta tátil em todas as interações principais

---

## 🎨 Sistema de Cores

### Paleta Principal

#### Primary (Indigo/Purple)
```typescript
primary: {
  50: '#EEF2FF',
  100: '#E0E7FF',
  200: '#C7D2FE',
  300: '#A5B4FC',
  400: '#818CF8',
  500: '#6366F1', // Main
  600: '#4F46E5',
  700: '#4338CA',
  800: '#3730A3',
  900: '#312E81',
}
```

#### Secondary (Emerald)
```typescript
secondary: {
  500: '#10B981', // Main
  400: '#34D399',
  600: '#059669',
}
```

#### Neutrals (Slate)
```typescript
slate: {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  950: '#020617',
}
```

### Tema Claro (Light Theme)

| Elemento | Cor | Uso |
|----------|-----|-----|
| Background Primary | `#FFFFFF` | Tela principal |
| Background Secondary | `#F8FAFC` | Áreas secundárias |
| Text Primary | `#0F172A` | Texto principal |
| Text Secondary | `#475569` | Texto secundário |
| Text Tertiary | `#94A3B8` | Texto terciário |
| Primary | `#4F46E5` | Ações principais |
| Border | `#E2E8F0` | Bordas e separadores |

### Tema Escuro (Dark Theme)

| Elemento | Cor | Uso |
|----------|-----|-----|
| Background Primary | `#020617` | Tela principal |
| Background Secondary | `#0F172A` | Áreas secundárias |
| Text Primary | `#F8FAFC` | Texto principal |
| Text Secondary | `#CBD5E1` | Texto secundário |
| Text Tertiary | `#64748B` | Texto terciário |
| Primary | `#6366F1` | Ações principais |
| Border | `#1E293B` | Bordas e separadores |

### Cores Semânticas

```typescript
success: '#10B981'  // Verde - ações bem-sucedidas
warning: '#F59E0B'  // Amarelo - avisos
error: '#EF4444'    // Vermelho - erros
info: '#3B82F6'     // Azul - informações
```

### Contraste e Acessibilidade

Todos os pares de cores seguem WCAG AA:
- **Texto normal**: Contraste mínimo de 4.5:1
- **Texto grande (18px+)**: Contraste mínimo de 3:1
- **Elementos interativos**: Contraste mínimo de 3:1

---

## 📏 Sistema de Espaçamento

### Escala Base (4px)

```typescript
spacing = {
  none: 0,
  xxs: 2,    // 0.5x
  xs: 4,     // 1x
  sm: 8,     // 2x
  md: 12,    // 3x
  base: 16,  // 4x
  lg: 20,    // 5x
  xl: 24,    // 6x
  '2xl': 32, // 8x
  '3xl': 40, // 10x
  '4xl': 48, // 12x
  '5xl': 64, // 16x
  '6xl': 80, // 20x
}
```

### Uso Recomendado

- **Padding interno de cards**: `spacing.base` (16px)
- **Espaçamento entre cards**: `spacing.base` (16px)
- **Espaçamento entre elementos relacionados**: `spacing.sm` (8px)
- **Espaçamento entre seções**: `spacing.xl` (24px)
- **Margem de tela**: `spacing.base` (16px)

---

## 🔤 Tipografia

### Escala de Tamanhos

```typescript
fontSize = {
  xs: 11,    // Caption
  sm: 13,    // Body Small
  base: 15,  // Body
  md: 17,    // Body Large
  lg: 19,    // H4
  xl: 22,    // H3
  '2xl': 26, // H2
  '3xl': 32, // H1
  '4xl': 40, // Display
}
```

### Estilos de Texto

| Estilo | Tamanho | Peso | Line Height | Uso |
|--------|---------|------|-------------|-----|
| Display | 36px | 700 | 44px | Títulos hero |
| H1 | 32px | 700 | 40px | Títulos principais |
| H2 | 26px | 700 | 34px | Títulos de seção |
| H3 | 22px | 600 | 30px | Subtítulos |
| H4 | 19px | 600 | 26px | Títulos de card |
| Body Large | 17px | 400 | 24px | Texto importante |
| Body | 15px | 400 | 22px | Texto padrão |
| Body Small | 13px | 400 | 18px | Texto secundário |
| Caption | 12px | 400 | 16px | Metadados |
| Overline | 11px | 500 | 14px | Labels |

### Fontes

- **iOS**: System (San Francisco)
- **Android**: Roboto
- **Fallback**: System

### Letter Spacing

- **Títulos grandes**: -0.5px a -0.2px (mais compacto)
- **Texto normal**: 0px
- **Labels/Overline**: +0.5px (mais espaçado)

---

## 📐 Border Radius

```typescript
borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
}
```

### Uso Recomendado

- **Botões**: `borderRadius.lg` (16px)
- **Cards**: `borderRadius.xl` (20px)
- **Inputs**: `borderRadius.lg` (16px)
- **Badges**: `borderRadius.md` (12px)
- **Avatares**: `borderRadius.full` (circular)

---

## 🌊 Sistema de Elevação

### Níveis de Elevação

```typescript
elevation = {
  none: { elevation: 0, shadowOpacity: 0 },
  sm: { elevation: 1, shadowOpacity: 0.05 },
  md: { elevation: 2, shadowOpacity: 0.08 },
  lg: { elevation: 4, shadowOpacity: 0.12 },
  xl: { elevation: 8, shadowOpacity: 0.16 },
  '2xl': { elevation: 12, shadowOpacity: 0.2 },
}
```

### Uso por Componente

| Componente | Elevação | Uso |
|------------|----------|-----|
| Cards | `md` | Elevação padrão |
| Botões Primary | `md` | Destaque |
| FAB | `xl` | Flutuante |
| Modais | `2xl` | Sobreposição |
| Inputs | `none` | Sem elevação |

### Dark Mode

No modo escuro, as elevações são mais sutis (shadowOpacity aumentado em ~25%) para evitar contraste excessivo.

---

## 🎭 Estados de Interação

### Estados Padrão

```typescript
interactionStates = {
  default: { opacity: 1, scale: 1 },
  hover: { opacity: 0.87, scale: 1.02 },
  pressed: { opacity: 0.7, scale: 0.98 },
  disabled: { opacity: 0.38, scale: 1 },
  loading: { opacity: 0.7, scale: 1 },
}
```

### Animações

- **Duração rápida**: 150ms (micro-interações)
- **Duração normal**: 250ms (transições padrão)
- **Duração lenta**: 350ms (animações complexas)

### Feedback Háptico

- **Light**: Interações simples (toque em card)
- **Medium**: Ações principais (botões)
- **Heavy**: Ações importantes (confirmações)

---

## 🧩 Componentes

### Button

**Variantes:**
- `primary`: Gradiente indigo/purple com elevação
- `secondary`: Fundo claro com texto primary
- `outline`: Borda com fundo transparente
- `ghost`: Apenas texto, sem borda

**Tamanhos:**
- `sm`: 32px altura
- `md`: 44px altura (padrão)
- `lg`: 52px altura

**Estados:**
- ✅ Default
- ✅ Hover (scale 1.02)
- ✅ Pressed (scale 0.98, opacity 0.7)
- ✅ Disabled (opacity 0.38)
- ✅ Loading (spinner)

### Input

**Características:**
- Altura mínima: 52px
- Border radius: 12px
- Estados: default, focused, error, disabled
- Ícone opcional à esquerda
- Botão de limpar à direita (quando há texto)

### Card

**Características:**
- Border radius: 20px
- Padding: 16px (padrão)
- Elevação: md (padrão)
- Estados: default, pressed (scale 0.98)

**Padding Options:**
- `none`: 0px
- `sm`: 8px
- `md`: 16px (padrão)
- `lg`: 24px

### Floating Action Button (FAB)

**Características:**
- Tamanho: 56x56px
- Border radius: 28px (circular)
- Elevação: xl
- Posições: bottom-right, bottom-left, top-right, top-left

### SearchBar

**Características:**
- Altura mínima: 48px
- Border radius: 16px
- Ícone de busca à esquerda
- Botão de limpar à direita
- Animação de scale no focus

---

## 📱 Grid System

### Colunas

- **Mobile**: 1 coluna (full width)
- **Tablet**: 2 colunas
- **Desktop**: 3+ colunas

### Gutter

- **Mobile**: 16px
- **Tablet**: 24px
- **Desktop**: 32px

### Margens

- **Mobile**: 16px
- **Tablet**: 24px
- **Desktop**: 32px

---

## 🎯 Hierarquia Visual

### Níveis de Importância

1. **Primário**: Títulos, botões principais, FAB
   - Tamanho: Grande
   - Cor: Primary
   - Elevação: Alta

2. **Secundário**: Subtítulos, botões secundários
   - Tamanho: Médio
   - Cor: Text Secondary
   - Elevação: Média

3. **Terciário**: Metadados, labels
   - Tamanho: Pequeno
   - Cor: Text Tertiary
   - Elevação: Baixa/Nenhuma

### Princípios

- **Contraste**: Elementos importantes têm mais contraste
- **Tamanho**: Hierarquia clara através de tamanhos
- **Espaçamento**: Elementos relacionados agrupados
- **Cor**: Cores primárias para ações importantes

---

## ♿ Acessibilidade

### Contraste

- ✅ Todos os textos seguem WCAG AA
- ✅ Elementos interativos com contraste mínimo 3:1
- ✅ Cores não são o único indicador de estado

### Área de Toque

- ✅ Mínimo 44x44px (Apple HIG)
- ✅ Espaçamento adequado entre elementos clicáveis
- ✅ Feedback visual e háptico

### Tipografia

- ✅ Tamanho mínimo: 12px
- ✅ Line height mínimo: 1.4
- ✅ Fontes do sistema para melhor legibilidade

---

## 🎨 Padrões de Design

### Material Design 3

- Sistema de elevação
- Animações suaves
- Estados de interação consistentes
- Grid system responsivo

### Apple HIG

- Área de toque mínima (44px)
- Tipografia do sistema
- Espaçamento generoso
- Feedback háptico

### Melhores Práticas

- **Consistência**: Mesmos padrões em todo o app
- **Clareza**: Hierarquia visual clara
- **Feedback**: Resposta imediata às ações
- **Performance**: Animações a 60fps

---

## 📚 Recursos

### Arquivos do Design System

- `src/theme/colors.ts` - Sistema de cores
- `src/theme/typography.ts` - Sistema de tipografia
- `src/theme/spacing.ts` - Sistema de espaçamento
- `src/theme/design-system.ts` - Tokens e utilitários

### Componentes Base

- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Avatar.tsx`

### Documentação Adicional

- Ver `UX_ANALYSIS.md` para análise de UX
- Ver `project.md` para visão geral do projeto

---

## 🔄 Changelog

### v1.1.0 (06 Dezembro 2024)
- ✅ **Contraste WCAG AA** - `text.tertiary` melhorado para 4.5:1 ratio
- ✅ **Focus States** - Novo token `focus.ring` e `focus.background` em light/dark
- ✅ **Input.tsx** - Refatorado para usar `theme`, animação de focus suave
- ✅ **SearchBar.tsx** - Integração com `getElevation()`, animações melhoradas
- ✅ **FAB.tsx** - Gradiente linear, animação de entrada, elevation do design-system
- ✅ **VideoCard.tsx** - Paridade com FeedCard: botões bookmark e share
- ✅ **Microinterações** - Spring animations com speed tokens consistentes
- ✅ **Touch Targets** - Todos botões >= 44px (Apple HIG)

### v1.0.0
- ✅ Sistema de cores unificado
- ✅ Estados de interação consistentes
- ✅ Hierarquia visual melhorada
- ✅ Contraste e acessibilidade otimizados
- ✅ Tipografia padronizada
- ✅ Sistema de elevação implementado

---

## 📝 Notas de Implementação

### Melhorias Aplicadas

1. **Unificação de Cores**
   - Sistema único baseado em `colors.ts`
   - Compatibilidade mantida com `ThemeContext`
   - Suporte completo a light/dark mode

2. **Estados de Interação**
   - Animações suaves em todos os componentes
   - Feedback háptico consistente
   - Estados visuais claros (hover, pressed, disabled)

3. **Hierarquia Visual**
   - Tamanhos de fonte aumentados para melhor legibilidade
   - Espaçamento otimizado entre elementos
   - Contraste melhorado em todos os componentes

4. **Componentes Otimizados**
   - Button: Animações e estados melhorados
   - Card: Elevação e interação otimizadas
   - Input: Animação de focus, usa `theme` tokens
   - SearchBar: Elevation dinâmica no focus
   - FAB: Gradiente, animação de entrada, elevation
   - VideoCard: Bookmark e share integrados

### Próximas Melhorias

- [ ] Sistema de tokens mais granular
- [ ] Documentação visual (Storybook)
- [ ] Testes de acessibilidade automatizados
- [ ] Suporte a modo de alto contraste
- [ ] Animações de transição entre telas

---

**Última atualização**: 06 Dezembro 2024

