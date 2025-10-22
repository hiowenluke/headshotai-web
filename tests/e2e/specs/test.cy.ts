describe('Navigation basic', () => {
  it('Visits pricing placeholder page', () => {
    cy.visit('/pricing')
    cy.contains('Plans & Pricing')
  })
})
