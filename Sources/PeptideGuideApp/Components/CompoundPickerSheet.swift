import SwiftUI

struct CompoundPickerSheet: View {
    let compounds: [Compound]
    let selected: [Compound]
    let onSelect: (Compound) -> Void
    let onDismiss: () -> Void

    @State private var searchText = ""

    private var filteredCompounds: [Compound] {
        if searchText.isEmpty {
            return compounds.sorted { $0.name < $1.name }
        }

        return compounds.filter { compound in
            [
                compound.name,
                compound.summary,
                compound.tags.joined(separator: " "),
                compound.categories.map(\.title).joined(separator: " "),
            ]
            .joined(separator: " ")
            .localizedCaseInsensitiveContains(searchText)
        }
        .sorted { $0.name < $1.name }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppSpacing.lg) {
            HStack {
                Text("Add to Compare")
                    .font(AppTypography.sectionTitle)
                    .foregroundStyle(AppColors.textPrimary)
                Spacer()
                Button("Done", action: onDismiss)
                    .buttonStyle(.plain)
                    .font(AppTypography.meta)
                    .foregroundStyle(AppColors.textPrimary)
                    .padding(.horizontal, AppSpacing.md)
                    .padding(.vertical, AppSpacing.xs)
                    .background(AppColors.controlBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .stroke(AppColors.border, lineWidth: 1)
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }

            TextField("Search compounds", text: $searchText)
                .textFieldStyle(.roundedBorder)
                .foregroundStyle(AppColors.textPrimary)

            List(filteredCompounds) { compound in
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(compound.name)
                            .foregroundStyle(AppColors.textPrimary)
                        Text(compound.summary)
                            .font(AppTypography.meta)
                            .foregroundStyle(AppColors.textSecondary)
                            .lineLimit(2)
                    }

                    Spacer()

                    if selected.contains(compound) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(AppColors.accent)
                    } else {
                        Button("Add") {
                            onSelect(compound)
                        }
                        .buttonStyle(.plain)
                        .font(AppTypography.meta)
                        .foregroundStyle(AppColors.textPrimary)
                        .padding(.horizontal, AppSpacing.md)
                        .padding(.vertical, AppSpacing.xs)
                        .background(AppColors.secondaryButtonBackground)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .stroke(AppColors.border, lineWidth: 1)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                        .disabled(selected.count >= 3)
                    }
                }
                .padding(.vertical, 4)
                .listRowBackground(AppColors.cardBackground)
            }
            .listStyle(.plain)
            .scrollContentBackground(.hidden)
            .background(AppColors.cardBackground)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
        .padding(AppSpacing.xl)
        .frame(minWidth: 560, minHeight: 480)
        .background(AppColors.background)
    }
}
