from setuptools import find_packages, setup

setup(
    name="ai-service",
    version="0.1.0",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=[
        "fastapi>=0.68.0",
        "uvicorn>=0.15.0",
        "python-dotenv>=0.19.0",
        "requests>=2.26.0",
        "pydantic>=1.8.0",
        "aiohttp>=3.8.0",
    ],
    extras_require={
        "test": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "httpx>=0.24.0",
            "pytest-cov>=4.1.0",
            "pytest-mock>=3.11.0",
        ],
    },
)
