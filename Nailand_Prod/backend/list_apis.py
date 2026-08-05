# list_apis.py
import os
import re
from pathlib import Path

def find_all_routes():
    """Find all API routes in the project"""
    
    # Set the backend directory
    backend_dir = Path(__file__).parent
    api_dir = backend_dir / "app" / "api" / "v1"
    
    print("=" * 80)
    print("📡 NAILAND METAVERSE API LIST")
    print("=" * 80)
    print(f"📁 Scanning directory: {api_dir}")
    print()
    
    if not api_dir.exists():
        print(f"❌ Directory not found: {api_dir}")
        print("Make sure you're running this script from the backend directory")
        return
    
    # Find all Python files in the api/v1 directory
    api_files = list(api_dir.glob("*.py"))
    api_files = [f for f in api_files if f.name != "__init__.py"]
    
    print(f"📄 Found {len(api_files)} API files:")
    for f in api_files:
        print(f"   - {f.name}")
    print()
    
    all_routes = []
    
    # Extract routes from each file
    for file_path in api_files:
        routes = extract_routes_from_file(file_path)
        all_routes.extend(routes)
    
    # Also check main.py for router prefixes
    main_file = backend_dir / "app" / "main.py"
    prefixes = extract_prefixes_from_main(main_file)
    
    # Print results by category
    if all_routes:
        print("=" * 80)
        print("📋 API ENDPOINTS")
        print("=" * 80)
        print()
        
        # Group by file
        routes_by_file = {}
        for route in all_routes:
            file_name = route['file']
            if file_name not in routes_by_file:
                routes_by_file[file_name] = []
            routes_by_file[file_name].append(route)
        
        for file_name, routes in sorted(routes_by_file.items()):
            # Get the base prefix for this router
            base_prefix = prefixes.get(file_name.replace('.py', ''), '/api/v1')
            category = file_name.replace('.py', '').upper()
            
            print(f"📁 {category} APIs")
            print("-" * 60)
            
            for route in sorted(routes, key=lambda x: x['path']):
                method = route['method']
                path = route['path']
                full_path = f"{base_prefix}{path}"
                
                # Method symbols
                method_symbol = {
                    'GET': '🟢',
                    'POST': '🟡',
                    'PUT': '🟠',
                    'DELETE': '🔴',
                    'PATCH': '🟣'
                }.get(method, '⚪')
                
                print(f"  {method_symbol} {method:6} {full_path}")
            
            print()
        
        # Print summary
        print("=" * 80)
        print(f"📊 TOTAL: {len(all_routes)} API endpoints")
        print("=" * 80)
        
        # Export to markdown
        export_to_markdown(all_routes, prefixes)
        
    else:
        print("❌ No routes found. Checking files manually...")
        # Debug: show file contents
        for file_path in api_files:
            print(f"\n--- {file_path.name} ---")
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Look for router patterns
                if '@router.' in content:
                    print("Found router decorators!")
                    lines = [line.strip() for line in content.split('\n') if '@router.' in line]
                    for line in lines:
                        print(f"  {line}")

def extract_routes_from_file(file_path: Path):
    """Extract routes from a single file"""
    routes = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern for router decorators
        # Matches: @router.get("/path") or @router.post("/path", ...)
        pattern = r'@router\.(get|post|put|delete|patch)\s*\(\s*["\']([^"\']+)["\']'
        
        matches = re.findall(pattern, content, re.IGNORECASE)
        
        for method, path in matches:
            routes.append({
                'method': method.upper(),
                'path': path,
                'file': file_path.stem
            })
            
    except Exception as e:
        print(f"Error reading {file_path.name}: {e}")
    
    return routes

def extract_prefixes_from_main(main_file: Path):
    """Extract router prefixes from main.py"""
    prefixes = {}
    
    try:
        with open(main_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern for include_router statements
        # Matches: app.include_router(auth.router, prefix="/api/v1")
        pattern = r'app\.include_router\(([^.]+)\.router,\s*prefix=["\']([^"\']+)["\']'
        
        matches = re.findall(pattern, content)
        
        for router_name, prefix in matches:
            prefixes[router_name] = prefix
            
    except Exception as e:
        print(f"Error reading main.py: {e}")
    
    return prefixes

def export_to_markdown(routes, prefixes):
    """Export routes to markdown file"""
    
    output_file = Path(__file__).parent / "API_LIST.md"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# NaiLand Metaverse API Documentation\n\n")
        f.write(f"**Generated:** {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"**Total Endpoints:** {len(routes)}\n\n")
        
        f.write("## Base URL\n")
        f.write("```\nhttp://localhost:8000\n```\n\n")
        
        # Group by file
        routes_by_file = {}
        for route in routes:
            file_name = route['file']
            if file_name not in routes_by_file:
                routes_by_file[file_name] = []
            routes_by_file[file_name].append(route)
        
        for file_name, file_routes in sorted(routes_by_file.items()):
            base_prefix = prefixes.get(file_name, '/api/v1')
            f.write(f"## {file_name.upper()} Endpoints\n\n")
            f.write(f"**Base Path:** `{base_prefix}`\n\n")
            f.write("| Method | Endpoint | Full URL |\n")
            f.write("|--------|----------|----------|\n")
            
            for route in sorted(file_routes, key=lambda x: x['path']):
                method = route['method']
                path = route['path']
                full_url = f"{base_prefix}{path}"
                f.write(f"| {method} | `{path}` | `{full_url}` |\n")
            
            f.write("\n")
        
        f.write("## Authentication\n\n")
        f.write("Most endpoints require a Bearer token:\n")
        f.write("```\nAuthorization: Bearer <your-jwt-token>\n```\n\n")
        f.write("## Interactive Documentation\n\n")
        f.write("- Swagger UI: `http://localhost:8000/docs`\n")
        f.write("- ReDoc: `http://localhost:8000/redoc`\n")
    
    print(f"\n📄 API list exported to: {output_file}")

if __name__ == "__main__":
    find_all_routes()