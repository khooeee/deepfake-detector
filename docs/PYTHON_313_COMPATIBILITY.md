# Python 3.13 Compatibility Notes

## Issue
The original `requirements.txt` specified exact versions that were not compatible with Python 3.13:
- `torch==2.2.0` - No wheels available for Python 3.13
- `pillow==10.2.0` - Build issues with Python 3.13

## Solution
Updated `requirements.txt` to use version ranges that support Python 3.13:

```txt
pillow>=10.3.0      # 10.3.0+ has Python 3.13 support
torch>=2.4.0        # 2.4.0+ has Python 3.13 wheels
torchvision>=0.19.0 # Compatible with torch 2.4.0+
transformers>=4.37.0
accelerate>=0.26.0
numpy>=1.26.0
```

## Recommended Python Versions
- **Python 3.13**: ✅ Supported (with updated requirements)
- **Python 3.12**: ✅ Fully supported
- **Python 3.11**: ✅ Fully supported
- **Python 3.10**: ✅ Fully supported
- **Python 3.9**: ✅ Minimum supported version

## Alternative: Use Python 3.12
If you encounter issues with Python 3.13, you can use Python 3.12 which has broader package support:

```bash
# Install Python 3.12 (macOS with Homebrew)
brew install python@3.12

# Create venv with Python 3.12
python3.12 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
```

## Using uv with Specific Python Version
```bash
# Use specific Python version with uv
cd backend
uv venv --python 3.12
uv pip install -r requirements.txt
```

## Verification
After installation, verify PyTorch is working:
```bash
python -c "import torch; print(f'PyTorch {torch.__version__}')"
python -c "import torchvision; print(f'TorchVision {torchvision.__version__}')"
```

## Notes
- PyTorch releases wheels for new Python versions a few months after release
- Using version ranges (>=) ensures compatibility with future releases
- The application functionality remains the same across all supported Python versions
