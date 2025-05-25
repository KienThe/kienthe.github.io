export UID=$(shell id -u)
export GID=$(shell id -g)

# Colors
CYAN=\033[0;36m
NC=\033[0m

.PHONY: help u d b p c l s db

help:
	@echo "${CYAN}Available commands:${NC}"
	@echo "  make u [ARGS]    - Start development environment (e.g. make u ARGS=--build)"
	@echo "  make d [ARGS]  - Stop containers"
	@echo "  make b [ARGS] - Build containers"
	@echo "  make p         - Build production image"
	@echo "  make c        - Remove volumes and containers"
	@echo "  make l [ARGS]  - View container logs"
	@echo "  make s        - Access app shell"
	@echo "  make db      - Access database CLI"

# Start development environment
u:
	@echo "${CYAN}Starting development environment...${NC}"
	docker compose up -d $(ARGS)

# Stop containers
d:
	@echo "${CYAN}Stopping containers...${NC}"
	docker compose down $(ARGS)

# Build containers
b:
	@echo "${CYAN}Building containers...${NC}"
	docker compose build $(ARGS)

# Build production image
p:
	@echo "${CYAN}Building production image...${NC}"
	docker build --target production -t backend .

# Clean up
c:
	@echo "${CYAN}Cleaning up...${NC}"
	docker compose down -v

# View logs
l:
	@echo "${CYAN}Showing logs...${NC}"
	docker compose logs -f $(ARGS)

# Access shell
s:
	@echo "${CYAN}Accessing app shell...${NC}"
	docker compose exec app sh

# Access database
db:
	@echo "${CYAN}Accessing database CLI...${NC}"
	docker compose exec db mysql -u$${DB_USERNAME} -p$${DB_PASSWORD} $${DB_DATABASE}
