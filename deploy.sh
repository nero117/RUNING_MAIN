#!/bin/bash

# 网页跑酷游戏部署脚本
# 使用方法: ./deploy.sh [环境]
# 环境选项: dev, staging, production

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查参数
ENVIRONMENT=${1:-dev}

log_info "开始部署网页跑酷游戏到 $ENVIRONMENT 环境..."

# 检查必要的工具
check_dependencies() {
    log_info "检查依赖..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    log_success "依赖检查通过"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖..."
    npm ci
    log_success "依赖安装完成"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    npm run build
    log_success "项目构建完成"
}

# 运行测试
run_tests() {
    log_info "运行测试..."
    npm test
    log_success "测试通过"
}

# 部署到不同环境
deploy_to_environment() {
    case $ENVIRONMENT in
        "dev")
            deploy_dev
            ;;
        "staging")
            deploy_staging
            ;;
        "production")
            deploy_production
            ;;
        *)
            log_error "未知环境: $ENVIRONMENT"
            log_info "支持的环境: dev, staging, production"
            exit 1
            ;;
    esac
}

# 开发环境部署
deploy_dev() {
    log_info "部署到开发环境..."
    export NODE_ENV=development
    export PORT=3000
    
    log_info "启动开发服务器..."
    npm start &
    
    log_success "开发环境部署完成"
    log_info "访问地址: http://localhost:3000"
}

# 预发布环境部署
deploy_staging() {
    log_info "部署到预发布环境..."
    export NODE_ENV=staging
    export PORT=3001
    
    # 检查Docker
    if command -v docker &> /dev/null; then
        log_info "使用Docker部署..."
        docker build -t web-runner-game:staging .
        docker run -d -p 3001:3000 --name web-runner-game-staging web-runner-game:staging
        log_success "预发布环境部署完成"
        log_info "访问地址: http://localhost:3001"
    else
        log_warning "Docker未安装，使用Node.js直接运行..."
        npm start &
        log_success "预发布环境部署完成"
        log_info "访问地址: http://localhost:3001"
    fi
}

# 生产环境部署
deploy_production() {
    log_info "部署到生产环境..."
    export NODE_ENV=production
    export PORT=${PORT:-3000}
    
    # 检查Docker Compose
    if command -v docker-compose &> /dev/null; then
        log_info "使用Docker Compose部署..."
        docker-compose down
        docker-compose up -d --build
        log_success "生产环境部署完成"
        log_info "访问地址: http://localhost:${PORT}"
    elif command -v docker &> /dev/null; then
        log_info "使用Docker部署..."
        docker build -t web-runner-game:latest .
        docker stop web-runner-game-prod 2>/dev/null || true
        docker rm web-runner-game-prod 2>/dev/null || true
        docker run -d -p ${PORT}:3000 --name web-runner-game-prod web-runner-game:latest
        log_success "生产环境部署完成"
        log_info "访问地址: http://localhost:${PORT}"
    else
        log_warning "Docker未安装，使用PM2部署..."
        if command -v pm2 &> /dev/null; then
            pm2 stop web-runner-game 2>/dev/null || true
            pm2 start server.js --name web-runner-game
            log_success "生产环境部署完成"
            log_info "访问地址: http://localhost:${PORT}"
        else
            log_error "PM2未安装，无法部署到生产环境"
            log_info "请安装Docker或PM2: npm install -g pm2"
            exit 1
        fi
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    sleep 5
    
    local port=${PORT:-3000}
    if curl -f http://localhost:${port}/health > /dev/null 2>&1; then
        log_success "健康检查通过"
    else
        log_error "健康检查失败"
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    log_success "🎮 网页跑酷游戏部署完成！"
    echo ""
    echo "📊 部署信息:"
    echo "  环境: $ENVIRONMENT"
    echo "  端口: ${PORT:-3000}"
    echo "  访问地址: http://localhost:${PORT:-3000}"
    echo "  健康检查: http://localhost:${PORT:-3000}/health"
    echo "  API统计: http://localhost:${PORT:-3000}/api/stats"
    echo ""
    echo "🎯 游戏操作:"
    echo "  空格键: 跳跃"
    echo "  ESC键: 暂停/恢复"
    echo "  R键: 重新开始"
    echo "  \`键: 调试控制台"
    echo ""
    echo "🛠️ 管理命令:"
    if command -v docker &> /dev/null; then
        echo "  查看日志: docker logs web-runner-game-${ENVIRONMENT}"
        echo "  停止服务: docker stop web-runner-game-${ENVIRONMENT}"
    fi
    if command -v pm2 &> /dev/null; then
        echo "  查看状态: pm2 status"
        echo "  查看日志: pm2 logs web-runner-game"
        echo "  重启服务: pm2 restart web-runner-game"
    fi
}

# 主执行流程
main() {
    check_dependencies
    install_dependencies
    build_project
    run_tests
    deploy_to_environment
    health_check
    show_deployment_info
}

# 错误处理
trap 'log_error "部署失败！"; exit 1' ERR

# 执行主流程
main

log_success "部署脚本执行完成！"