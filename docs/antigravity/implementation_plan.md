# Filter UI Refinement Plan

The goal is to improve the design of the "Omiya Station" and "Other" filter checkboxes in the `SearchPanel`. We will transition from standard checkboxes to **interactive selection cards**.

## User Review Required
> [!NOTE]
> The interaction model remains the same (multi-select), but the visual presentation will change significantly.

## Proposed Changes

### [SearchPanel.tsx]
- Replace the simple `div > Checkbox + Label` structure with a clickable `div` container.
- **Container Styling**:
  - Rounded corners (`rounded-xl` or similar).
  - Border and background color changes based on `checked` state.
  - Hover effects for better interactivity.
- **Layout**:
  - `flex-1` to allow cards to fill the available width evenly.
  - Vertical alignment of text (Label + Count).

**Visual State:**
- **Selected**: `bg-blue-50 border-blue-200`
- **Unselected**: `bg-white border-gray-200`

#### [MODIFY] [SearchPanel.tsx](file:///Users/yoshi/Desktop/OmiyaBusRoute/src/components/SearchPanel.tsx)

## Verification Plan

### Manual Verification
1. **Visual Check**:
   - Ensure the filters look like clickable cards.
   - Verify the "Selected" state is clearly distinct (blue tint).
   - Check hover states.
2. **Interaction Check**:
   - Click the *card itself* (not just the checkbox) to toggle.
   - Click the *label* to toggle.
   - Ensure filtering still works (counts update, list updates).
