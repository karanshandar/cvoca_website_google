# Development Guidelines for CVOCA Website

## Workflow Process

1. **Think and Plan First**
   - Thoroughly analyze the problem and understand the requirements
   - Read the codebase to identify all relevant files
   - Write a detailed plan to `tasks/todo.md` with actionable items

2. **Create a Checklist**
   - The plan should contain a clear list of todo items
   - Each item should be granular enough to check off as completed
   - Keep tasks simple and focused

3. **Verify Before Execution**
   - Before beginning work, present the plan for review
   - Wait for verification and approval before proceeding
   - This ensures alignment on the approach

4. **Execute with Transparency**
   - Work through todo items sequentially
   - Mark tasks as complete as you finish them
   - Provide high-level explanations of changes at each step
   - Keep the user informed of progress

5. **Prioritize Simplicity**
   - Make every task and code change as simple as possible
   - Avoid massive or complex changes
   - Each change should impact as little code as possible
   - Focus on minimal, targeted modifications
   - The goal is to reduce the risk of introducing bugs

6. **Document Your Work**
   - Add a review section to the `todo.md` file when complete
   - Include a summary of all changes made
   - Document any relevant information for future reference

## Code Quality Standards

### No Lazy Development
- **NEVER take shortcuts or implement temporary fixes**
- If there is a bug, find the ROOT CAUSE and fix it properly
- Act as a senior developer with high standards
- Every fix should be production-ready and maintainable

### Simplicity Above All
- Make all fixes and code changes as simple as humanly possible
- Changes should ONLY impact code relevant to the task
- Minimize the surface area of modifications
- The goal is to NOT introduce ANY bugs
- When in doubt, choose the simpler solution

### Impact Minimization
- Only modify necessary code
- Avoid refactoring unrelated code
- Don't add features beyond the scope of the task
- Keep the blast radius of changes as small as possible

## Design Principles

### Mobile-First Approach
- All layouts must be designed with a **mobile-first** approach
- Start with mobile designs and progressively enhance for larger screens
- Ensure full responsiveness across all screen sizes:
  - Mobile (portrait and landscape)
  - Tablet (portrait and landscape)
  - Desktop (various resolutions)
  - Large displays (4K, ultrawide, etc.)

### Responsive Design Requirements
- Use responsive units (rem, em, %, vw, vh) where appropriate
- Implement proper breakpoints for different screen sizes
- Test layouts on multiple devices and screen sizes
- Ensure touch-friendly interfaces on mobile devices
- Optimize performance for mobile networks

## Summary

**The three pillars of this project:**
1. **Simplicity** - Keep everything as simple as possible
2. **Thoroughness** - No lazy development, fix root causes
3. **Minimal Impact** - Change only what's necessary

Remember: The best code is simple, maintainable, and solves the problem without creating new ones.
