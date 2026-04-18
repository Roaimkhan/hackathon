from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, startups, invest, portfolio, milestones, wallet

app = FastAPI(
    title="Crowdfunding Platform API",
    description="REST API for a crowdfunding platform connecting investors and founders",
    version="1.0.0",
)

# CORS – allow all origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router)
app.include_router(startups.router)
app.include_router(invest.router)
app.include_router(portfolio.router)
app.include_router(milestones.router)
app.include_router(wallet.router)


@app.get("/", tags=["Health"])
async def health_check():
    return {"status": "ok", "message": "Crowdfunding Platform API is running"}
