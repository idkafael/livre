"""
Configuração do banco de dados
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncResult
import os

# Para desenvolvimento sem banco de dados real, vamos criar uma versão mockada
# Se você quiser usar um banco real, configure a DATABASE_URL no config.py

# Armazenamento em memória para desenvolvimento
_in_memory_storage = {
    "payments": [],
    "plans": []
}

# Mock database session para desenvolvimento
class MockAsyncSession:
    """Mock de sessão do banco de dados para desenvolvimento"""
    
    def __init__(self):
        self._objects = []
        self._committed = False
    
    def add(self, obj):
        """Adiciona objeto à sessão"""
        if not hasattr(obj, 'id') or obj.id is None:
            # Gerar ID baseado no tipo
            table_name = obj.__tablename__ if hasattr(obj, '__tablename__') else 'default'
            storage = _in_memory_storage.get(table_name, [])
            obj.id = len(storage) + 1
        self._objects.append(obj)
    
    async def commit(self):
        """Commit da transação"""
        # Salvar objetos no armazenamento em memória
        for obj in self._objects:
            table_name = obj.__tablename__ if hasattr(obj, '__tablename__') else 'default'
            if table_name not in _in_memory_storage:
                _in_memory_storage[table_name] = []
            
            # Verificar se já existe
            existing = next((o for o in _in_memory_storage[table_name] if o.id == obj.id), None)
            if existing:
                # Atualizar
                idx = _in_memory_storage[table_name].index(existing)
                _in_memory_storage[table_name][idx] = obj
            else:
                # Adicionar novo
                _in_memory_storage[table_name].append(obj)
        
        self._committed = True
    
    async def refresh(self, obj):
        """Refresh do objeto"""
        pass
    
    async def execute(self, query):
        """Executa query"""
        # Simplificar: retornar resultados do armazenamento em memória
        class MockResult:
            def __init__(self, objects):
                self.objects = objects or []
            
            def scalar_one_or_none(self):
                if self.objects:
                    return self.objects[0]
                return None
            
            def scalar_all(self):
                return self.objects
        
        # Tentar extrair informações da query
        # Por enquanto, retornar lista vazia (será preenchida quando objetos forem adicionados)
        return MockResult([])
    
    def __enter__(self):
        return self
    
    def __exit__(self, *args):
        pass


# Função para obter sessão do banco de dados
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency para obter sessão do banco de dados
    
    Por enquanto, retorna uma sessão mockada.
    Para usar banco real, configure DATABASE_URL e descomente o código abaixo.
    """
    # Versão mockada para desenvolvimento
    db = MockAsyncSession()
    try:
        yield db
    finally:
        pass
    
    # Código para banco de dados real (descomente quando configurar):
    # from core.config import settings
    # if settings.DATABASE_URL:
    #     engine = create_async_engine(settings.DATABASE_URL)
    #     async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    #     async with async_session() as session:
    #         yield session
    # else:
    #     # Fallback para mock
    #     db = MockAsyncSession()
    #     try:
    #         yield db
    #     finally:
    #         pass

