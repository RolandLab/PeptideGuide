import SwiftUI

struct CompareSelectionBar: View {
    let compounds: [Compound]
    let onSelect: (Compound) -> Void
    let onRemove: (Compound) -> Void
    let onAdd: () -> Void
    let onSaveSet: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.md) {
            HStack {
                Text("Selected Compounds")
                    .font(AppTypography.sectionTitle)
                    .foregroundStyle(AppColors.textPrimary)
                Spacer()
                Button("Save Set", action: onSaveSet)
                    .buttonStyle(.bordered)
                    .disabled(compounds.count < 2)
                Button("Add Compound", action: onAdd)
                    .buttonStyle(.borderedProminent)
                    .disabled(compounds.count >= 3)
            }

            if compounds.isEmpty {
                Text("Choose 2-3 compounds to compare mechanism, systems, and differentiators.")
                    .font(AppTypography.body)
                    .foregroundStyle(AppColors.textSecondary)
            } else {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: AppSpacing.sm) {
                        ForEach(compounds) { compound in
                            HStack(spacing: AppSpacing.xs) {
                                Button(compound.name) {
                                    onSelect(compound)
                                }
                                .buttonStyle(.plain)
                                .foregroundStyle(AppColors.textPrimary)

                                Button {
                                    onRemove(compound)
                                } label: {
                                    Image(systemName: "xmark.circle.fill")
                                        .foregroundStyle(AppColors.textSecondary)
                                }
                                .buttonStyle(.plain)
                            }
                            .padding(.horizontal, AppSpacing.md)
                            .padding(.vertical, AppSpacing.sm)
                            .background(AppColors.secondaryCardBackground)
                            .clipShape(Capsule())
                        }
                    }
                }
            }
        }
        .padding(AppSpacing.lg)
        .background(AppColors.cardBackground)
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(AppColors.border, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }
}
