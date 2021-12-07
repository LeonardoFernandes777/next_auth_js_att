export function validadeUserPermissions({ user, permissions, roles }) {
  if (permissions?.length > 0) {
    //verificar se existe mais que 1 permissão
    const hasAllPermissions = permissions.every((permission) => {
      // every só retorna true caso todas as condições estiverem satisfeitas
      return user.permissions.includes(permission); //verificar se as permissions do user inclui essa permission que eu to esperando que ele tenha
    });

    if (!hasAllPermissions) {
      // se ele não tiver todas as permissoes
      return false;
    }

    if (roles?.length > 0) {
      //verificar se existe mais que 1 roles
      const hasAllPermissions = roles.some((role) => {
        // every só retorna true se ele tiver pelo menos 1
        //pois ai pode ser passado mais de 1 role , Exemplo adiminstrador e editor pode ver tal coisa
        return user.roles.includes(role); //verificar se as roles do user inclui essa role que eu to esperando que ele tenha
      });

      if (!hasAllPermissions) {
        // se ele não tiver todas as roles
        return false;
      }
    }
    return true;
  }
}
