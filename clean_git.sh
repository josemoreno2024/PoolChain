#!/bin/bash

echo "🧹 Limpiando repositorio Git..."
echo ""

# Remover node_modules
echo "📦 Removiendo node_modules..."
git rm -r --cached node_modules/ 2>/dev/null || echo "  ✓ node_modules no estaba en git"
git rm -r --cached contracts/node_modules/ 2>/dev/null || echo "  ✓ contracts/node_modules no estaba en git"

# Remover artifacts
echo "🔨 Removiendo artifacts..."
git rm -r --cached contracts/artifacts/ 2>/dev/null || echo "  ✓ artifacts no estaba en git"
git rm -r --cached contracts/cache/ 2>/dev/null || echo "  ✓ cache no estaba en git"
git rm -r --cached contracts/typechain-types/ 2>/dev/null || echo "  ✓ typechain-types no estaba en git"

# Remover .env
echo "🔐 Removiendo archivos .env..."
git rm --cached .env 2>/dev/null || echo "  ✓ .env no estaba en git"
git rm --cached contracts/.env 2>/dev/null || echo "  ✓ contracts/.env no estaba en git"

# Remover IDE
echo "💻 Removiendo archivos de IDE..."
git rm -r --cached .vscode/ 2>/dev/null || echo "  ✓ .vscode no estaba en git"
git rm -r --cached .idea/ 2>/dev/null || echo "  ✓ .idea no estaba en git"

# Remover build
echo "📦 Removiendo archivos de build..."
git rm -r --cached dist/ 2>/dev/null || echo "  ✓ dist no estaba en git"
git rm -r --cached build/ 2>/dev/null || echo "  ✓ build no estaba en git"

echo ""
echo "✅ Limpieza completada!"
echo ""
echo "📊 Estado actual del repositorio:"
git status --short | wc -l
echo " archivos modificados"
echo ""
echo "⚠️  Para finalizar, ejecuta:"
echo "   git add .gitignore contracts/.gitignore"
echo "   git commit -m 'chore: clean repository'"
